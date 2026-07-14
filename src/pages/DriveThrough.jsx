import { useState, useEffect, useRef, useCallback } from 'react'
import './DriveThrough.css'

const SAMPLE_RATE = 24000
const API_BASE = 'https://fastxfood-api-764628510125.us-central1.run.app'

function formatPrice(cents) {
  if (!cents) return ''
  return `$${(cents / 100).toFixed(2)}`
}

function menuPrice(item) {
  if (item.sizes?.length) {
    return `${formatPrice(item.sizes[0].price)}–${formatPrice(item.sizes[item.sizes.length - 1].price)}`
  }
  return formatPrice(item.basePrice)
}

export default function DriveThrough() {
  const [status, setStatus] = useState('idle')
  const [orderItems, setOrderItems] = useState([])
  const [subtotal, setSubtotal] = useState('')
  const [calories, setCalories] = useState(0)
  const [confirmation, setConfirmation] = useState(null)
  const [loyalty, setLoyalty] = useState(null)
  const [userText, setUserText] = useState('')
  const [agentText, setAgentText] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [menu, setMenu] = useState([])

  const wsRef = useRef(null)
  const audioCtxRef = useRef(null)
  const micStreamRef = useRef(null)
  const captureNodeRef = useRef(null)
  const workletReadyRef = useRef(false)
  const isRecordingRef = useRef(false)
  const nextPlayTimeRef = useRef(0)
  const sourcesRef = useRef([])
  const speakingTimerRef = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/v1/menu`)
      .then(r => r.json())
      .then(data => setMenu(data.categories || []))
      .catch(() => {})
    return () => {
      if (wsRef.current) wsRef.current.close()
      stopRecording()
    }
  }, [])

  function setSpeaking(val) {
    if (val) {
      clearTimeout(speakingTimerRef.current)
      setIsSpeaking(true)
    } else {
      speakingTimerRef.current = setTimeout(() => setIsSpeaking(false), 400)
    }
  }

  function setSpeakingImmediate(val) {
    clearTimeout(speakingTimerRef.current)
    setIsSpeaking(val)
  }

  async function initAudio() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE })
    }
    if (!workletReadyRef.current) {
      await audioCtxRef.current.audioWorklet.addModule('/audio-processor.js')
      workletReadyRef.current = true
    }
  }

  function playAudioChunk(base64) {
    const ctx = audioCtxRef.current
    if (!ctx) return
    const bytes = atob(base64)
    const arr = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
    const int16 = new Int16Array(arr.buffer)
    const float32 = new Float32Array(int16.length)
    for (let j = 0; j < int16.length; j++) float32[j] = int16[j] / 32768.0

    const buffer = ctx.createBuffer(1, float32.length, SAMPLE_RATE)
    buffer.copyToChannel(float32, 0)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)

    const now = ctx.currentTime
    if (nextPlayTimeRef.current < now) nextPlayTimeRef.current = now
    source.start(nextPlayTimeRef.current)
    nextPlayTimeRef.current += buffer.duration

    sourcesRef.current.push(source)
    setSpeaking(true)
    source.onended = () => {
      sourcesRef.current = sourcesRef.current.filter(s => s !== source)
      if (sourcesRef.current.length === 0) setSpeaking(false)
    }
  }

  function clearPlayback() {
    sourcesRef.current.forEach(s => { try { s.stop() } catch {} })
    sourcesRef.current = []
    nextPlayTimeRef.current = 0
    setSpeakingImmediate(false)
  }

  async function startRecording() {
    await initAudio()
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') await ctx.resume()

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: SAMPLE_RATE, channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    })
    micStreamRef.current = stream
    const nativeRate = ctx.sampleRate
    const ratio = Math.round(nativeRate / SAMPLE_RATE)

    const sourceNode = ctx.createMediaStreamSource(stream)
    const workletNode = new AudioWorkletNode(ctx, 'capture-processor')

    workletNode.port.onmessage = (e) => {
      if (!isRecordingRef.current || !wsRef.current || wsRef.current.readyState !== 1) return
      let samples = e.data
      if (ratio > 1) {
        const down = new Float32Array(Math.floor(samples.length / ratio))
        for (let i = 0; i < down.length; i++) down[i] = samples[i * ratio]
        samples = down
      }
      const int16 = new Int16Array(samples.length)
      for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]))
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }
      const bytes = new Uint8Array(int16.buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      const b64 = btoa(binary)
      wsRef.current.send(JSON.stringify({ realtimeInput: { audio: b64 } }))
    }

    sourceNode.connect(workletNode)
    workletNode.connect(ctx.destination)
    captureNodeRef.current = workletNode
    isRecordingRef.current = true
  }

  function stopRecording() {
    isRecordingRef.current = false
    if (captureNodeRef.current) {
      captureNodeRef.current.disconnect()
      captureNodeRef.current = null
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop())
      micStreamRef.current = null
    }
  }

  function handlePayload(payload) {
    if (payload.type === 'order_update') {
      setConfirmation(null)
      setOrderItems(payload.items || [])
      setSubtotal(payload.subtotal_display || '')
      setCalories(payload.calorie_total || 0)
    } else if (payload.type === 'order_confirmed') {
      setConfirmation(payload)
      setOrderItems([])
    } else if (payload.type === 'loyalty_identified') {
      setLoyalty(payload)
    }
  }

  function connect() {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${window.location.host}/ws/voice`)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connecting')
      startRecording().then(() => setStatus('recording')).catch(() => setStatus('error'))
    }

    ws.onmessage = (e) => {
      let msg
      try { msg = JSON.parse(e.data) } catch { return }

      if (msg.error) {
        setStatus('error')
        setAgentText(msg.error)
        return
      }
      if (msg.sessionOutput) {
        const so = msg.sessionOutput
        if (so.payload) {
          handlePayload(so.payload)
          return
        }
        if (so.audio) playAudioChunk(so.audio)
        if (so.text) setAgentText(so.text)
      }
      if (msg.recognitionResult?.transcript) {
        setUserText(msg.recognitionResult.transcript)
      }
      if (msg.interruptionSignal) {
        clearPlayback()
      }
      if (msg.endSession) {
        setStatus('ended')
        stopRecording()
      }
    }

    ws.onclose = () => {
      if (status !== 'ended') setStatus('disconnected')
    }
    ws.onerror = () => setStatus('error')
  }

  function handleMicClick() {
    if (!wsRef.current || wsRef.current.readyState !== 1) {
      connect()
    } else if (isRecordingRef.current) {
      stopRecording()
      setStatus('paused')
    } else {
      startRecording().then(() => setStatus('recording'))
    }
  }

  const statusLabel = {
    idle: 'Click the microphone to start your order',
    connecting: 'Connecting to agent...',
    recording: 'Listening...',
    paused: 'Mic paused — click to resume',
    ended: 'Session ended — refresh to start over',
    disconnected: 'Disconnected — refresh to reconnect',
    error: 'Connection error',
  }

  return (
    <div className="dt-page">
      {loyalty && (
        <div className="dt-loyalty">
          <span className="dt-loyalty-name">{loyalty.customer_name}</span>
          <span className="dt-loyalty-points">{loyalty.points_balance?.toLocaleString()} pts</span>
        </div>
      )}

      <div className="dt-main">
        {/* Order Panel */}
        <div className="dt-panel dt-order">
          <h2 className="dt-panel-title">Your Order</h2>

          {confirmation ? (
            <div className="dt-confirmed">
              <div className="dt-confirmed-check">&#10003;</div>
              <h3>Order Confirmed</h3>
              <div className="dt-confirmed-row">
                <span>Order #</span><span>{confirmation.order_number}</span>
              </div>
              <div className="dt-confirmed-row">
                <span>Total</span><span>{confirmation.total_with_tax}</span>
              </div>
              <div className="dt-confirmed-row">
                <span>Wait</span><span>~{confirmation.estimated_wait} min</span>
              </div>
              <p className="dt-confirmed-msg">Pull forward to the window for payment.</p>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="dt-empty">Start talking to add items to your order.</div>
          ) : (
            <>
              <div className="dt-items">
                {orderItems.map((item, i) => {
                  const details = [
                    item.quantity > 1 && `Qty: ${item.quantity}`,
                    item.size,
                    ...(item.modifications || []),
                    ...(item.choices || []),
                  ].filter(Boolean).join(' · ')
                  return (
                    <div className="dt-item" key={i}>
                      <div className="dt-item-top">
                        <span className="dt-item-name">{item.name}</span>
                        <span className="dt-item-price">{formatPrice(item.total_price)}</span>
                      </div>
                      {details && <div className="dt-item-details">{details}</div>}
                    </div>
                  )
                })}
              </div>
              <div className="dt-order-footer">
                <div className="dt-footer-row">
                  <span>Subtotal</span><span className="dt-footer-value">{subtotal}</span>
                </div>
                {calories > 0 && (
                  <div className="dt-footer-row dt-footer-cal">
                    <span>Calories</span><span>{calories}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Menu Panel */}
        <div className="dt-panel dt-menu">
          <h2 className="dt-panel-title">Menu</h2>
          <div className="dt-menu-scroll">
            {menu.map(cat => (
              <div key={cat.id} className="dt-menu-cat">
                <h3 className="dt-menu-cat-name">{cat.name}</h3>
                {cat.items.map(item => (
                  <div className="dt-menu-item" key={item.id}>
                    <span className="dt-menu-item-name">{item.name}</span>
                    <span className="dt-menu-item-price">{menuPrice(item)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="dt-controls">
        <div className="dt-transcript">
          {userText && <div className="dt-transcript-user"><span className="dt-label">You</span> {userText}</div>}
          {agentText && <div className="dt-transcript-agent"><span className="dt-label">Agent</span> {agentText}</div>}
        </div>

        <div className="dt-mic-area">
          <button
            className={`dt-mic-btn ${status === 'recording' ? 'recording' : ''} ${isSpeaking ? 'speaking' : ''}`}
            onClick={handleMicClick}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="1" width="6" height="12" rx="3" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            {status === 'recording' && <span className="dt-mic-pulse" />}
          </button>
          <div className="dt-status">{statusLabel[status]}</div>
        </div>
      </div>
    </div>
  )
}
