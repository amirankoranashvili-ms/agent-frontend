import { useState, useEffect, useRef } from 'react'
import './ChatSidebar.css'

const SAMPLE_RATE = 24000

function MiniBot({ className }) {
  return (
    <div className={`mini-bot ${className || ''}`}>
      <div className="mini-bot-eye" /><div className="mini-bot-eye" />
      <div className="mini-bot-mouth" />
    </div>
  )
}

export default function ChatSidebar() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [order, setOrder] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  const wsRef = useRef(null)
  const audioCtxRef = useRef(null)
  const micStreamRef = useRef(null)
  const captureNodeRef = useRef(null)
  const workletReadyRef = useRef(false)
  const recordingRef = useRef(false)
  const nextPlayTimeRef = useRef(0)
  const sourcesRef = useRef([])
  const speakingTimerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const keepaliveRef = useRef(null)

  const isDisconnected = status === 'disconnected' || status === 'ended' || status === 'error'

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, order, confirmation])

  useEffect(() => {
    return () => {
      clearInterval(keepaliveRef.current)
      if (wsRef.current) wsRef.current.close()
      stopRecording()
    }
  }, [])

  function addMessage(role, text) {
    setMessages(prev => [...prev, { role, text, time: new Date() }])
  }

  function setSpeakingDebounced(val) {
    if (val) {
      clearTimeout(speakingTimerRef.current)
      setIsSpeaking(true)
    } else {
      speakingTimerRef.current = setTimeout(() => setIsSpeaking(false), 400)
    }
  }

  function handleNewSession() {
    clearInterval(keepaliveRef.current)
    if (wsRef.current) wsRef.current.close()
    wsRef.current = null
    stopRecording()
    clearPlayback()
    setMessages([])
    setOrder(null)
    setConfirmation(null)
    setStatus('idle')
  }

  // ─── Audio ───

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
    setSpeakingDebounced(true)
    source.onended = () => {
      sourcesRef.current = sourcesRef.current.filter(s => s !== source)
      if (sourcesRef.current.length === 0) setSpeakingDebounced(false)
    }
  }

  function clearPlayback() {
    sourcesRef.current.forEach(s => { try { s.stop() } catch {} })
    sourcesRef.current = []
    nextPlayTimeRef.current = 0
    clearTimeout(speakingTimerRef.current)
    setIsSpeaking(false)
  }

  // ─── Mic ───

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
      if (!recordingRef.current || !wsRef.current || wsRef.current.readyState !== 1) return
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
      wsRef.current.send(JSON.stringify({ realtimeInput: { audio: btoa(binary) } }))
    }

    sourceNode.connect(workletNode)
    workletNode.connect(ctx.destination)
    captureNodeRef.current = workletNode
    recordingRef.current = true
    setIsRecording(true)
  }

  function stopRecording() {
    recordingRef.current = false
    setIsRecording(false)
    if (captureNodeRef.current) {
      captureNodeRef.current.disconnect()
      captureNodeRef.current = null
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop())
      micStreamRef.current = null
    }
  }

  // ─── WebSocket ───

  function ensureConnected() {
    return new Promise((resolve) => {
      if (wsRef.current && wsRef.current.readyState === 1) {
        resolve()
        return
      }

      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${proto}//${window.location.host}/ws/chat`)
      wsRef.current = ws
      setStatus('connecting')

      ws.onopen = () => {
        setStatus('connected')
        initAudio()
        clearInterval(keepaliveRef.current)
        keepaliveRef.current = setInterval(() => {
          if (ws.readyState === 1 && !recordingRef.current) {
            ws.send(JSON.stringify({ realtimeInput: { text: "" } }))
          }
        }, 10000)
        resolve()
      }

      ws.onmessage = (e) => {
        let msg
        try { msg = JSON.parse(e.data) } catch { return }

        if (msg.error) {
          addMessage('system', msg.error)
          return
        }
        if (msg.sessionOutput) {
          const so = msg.sessionOutput
          if (so.payload) {
            handlePayload(so.payload)
            return
          }
          if (so.audio && recordingRef.current) playAudioChunk(so.audio)
          if (so.text) {
            const newText = so.text
            setMessages(prev => {
              const last = prev[prev.length - 1]
              if (last && last.role === 'agent' && last.streaming) {
                if (newText.startsWith(last.text) || last.text.startsWith(newText)) {
                  const longer = newText.length >= last.text.length ? newText : last.text
                  return [...prev.slice(0, -1), { ...last, text: longer }]
                }
                return [...prev.slice(0, -1), { ...last, streaming: false }, { role: 'agent', text: newText, time: new Date(), streaming: true }]
              }
              return [...prev, { role: 'agent', text: newText, time: new Date(), streaming: true }]
            })
          }
        }
        if (msg.recognitionResult?.transcript) {
          const t = msg.recognitionResult.transcript
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last && last.role === 'user' && last.streaming) {
              return [...prev.slice(0, -1), { ...last, text: t }]
            }
            const finalized = prev.map(m => m.streaming ? { ...m, streaming: false } : m)
            return [...finalized, { role: 'user', text: t, time: new Date(), streaming: true }]
          })
        }
        if (msg.interruptionSignal) {
          clearPlayback()
        }
        if (msg.endSession) {
          setStatus('ended')
          stopRecording()
        }
      }

      ws.onclose = () => { clearInterval(keepaliveRef.current); setStatus('disconnected') }
      ws.onerror = () => { clearInterval(keepaliveRef.current); setStatus('error') }
    })
  }

  function handlePayload(payload) {
    if (payload.type === 'order_update') {
      setConfirmation(null)
      setOrder(payload.items?.length ? payload : null)
    } else if (payload.type === 'order_confirmed') {
      setConfirmation(payload)
      setOrder(null)
    }
  }

  // ─── Send Text ───

  async function sendQuick(text) {
    setMessages(prev => {
      const finalized = prev.map(m => m.streaming ? { ...m, streaming: false } : m)
      return [...finalized, { role: 'user', text, time: new Date() }]
    })
    await ensureConnected()
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ realtimeInput: { text } }))
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    setMessages(prev => {
      const finalized = prev.map(m => m.streaming ? { ...m, streaming: false } : m)
      return [...finalized, { role: 'user', text, time: new Date() }]
    })

    await ensureConnected()
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ realtimeInput: { text } }))
    }
  }

  // ─── Toggle Mic ───

  async function handleMicToggle() {
    await ensureConnected()
    if (recordingRef.current) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  function formatPrice(cents) {
    return cents ? `$${(cents / 100).toFixed(2)}` : ''
  }

  function itemDetails(item) {
    const parts = []
    if (item.size) parts.push(item.size)
    if (item.modifications?.length) parts.push(...item.modifications)
    if (item.choices?.length) parts.push(...item.choices)
    return parts.join(' · ')
  }

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Open chat">
          <div className="chat-fab-bot">
            <div className="chat-fab-eye" /><div className="chat-fab-eye" />
            <div className="chat-fab-mouth" />
          </div>
        </button>
      )}

      <div className={`chat-sidebar ${open ? 'open' : ''} ${isDisconnected ? 'disconnected' : ''}`}>
        <div className="chat-sidebar-header">
          <div className={`chat-sidebar-logo ${isSpeaking ? 'speaking' : ''}`}>
            <MiniBot className={isDisconnected ? 'offline' : ''} />
          </div>
          <div className="chat-sidebar-header-text">
            <div className="chat-sidebar-title">Fast X Food</div>
            <div className="chat-sidebar-status">
              {status === 'idle' && 'Type or tap mic to start'}
              {status === 'connecting' && 'Connecting...'}
              {status === 'connected' && (isRecording ? 'Listening...' : 'Online')}
              {status === 'ended' && 'Session ended'}
              {status === 'disconnected' && 'Disconnected'}
              {status === 'error' && 'Connection error'}
            </div>
          </div>
          {isDisconnected && (
            <button className="chat-new-session-btn" onClick={handleNewSession}>New Chat</button>
          )}
          <button className="chat-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && !order && !confirmation && (
            <div className="chat-welcome">
              <p>Ask about our menu, place an order, or check your loyalty points.</p>
              <div className="chat-suggestions">
                <button onClick={() => sendQuick("What's on the menu?")}>What's on the menu?</button>
                <button onClick={() => sendQuick("I want a burger")}>I want a burger</button>
                <button onClick={() => sendQuick("What combos do you have?")}>Combos?</button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
              {msg.role === 'agent' && (
                <div className="chat-msg-avatar">
                  <MiniBot className="avatar-bot" />
                </div>
              )}
              <div className="chat-msg-bubble">{msg.text}</div>
            </div>
          ))}

          {order && order.items && order.items.length > 0 && (
            <div className="chat-order-card">
              <div className="chat-order-title">Your Order</div>
              {order.items.map((item, i) => {
                const details = itemDetails(item)
                return (
                  <div key={i} className="chat-order-item">
                    <div className="chat-order-item-main">
                      <span>{item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}</span>
                      <span className="chat-order-price">{formatPrice(item.total_price)}</span>
                    </div>
                    {details && <div className="chat-order-item-details">{details}</div>}
                  </div>
                )
              })}
              <div className="chat-order-total">
                <span>Subtotal</span>
                <span>{order.subtotal_display}</span>
              </div>
            </div>
          )}

          {confirmation && (
            <div className="chat-confirmed-card">
              <div className="chat-confirmed-check">&#10003;</div>
              <div className="chat-confirmed-title">Order Confirmed</div>
              <div className="chat-confirmed-row"><span>Order #</span><span>{confirmation.order_number}</span></div>
              <div className="chat-confirmed-row"><span>Total</span><span>{confirmation.total_with_tax}</span></div>
              <div className="chat-confirmed-row"><span>Wait</span><span>~{confirmation.estimated_wait} min</span></div>
            </div>
          )}

          {isDisconnected && messages.length > 0 && (
            <div className="chat-disconnected-banner">
              Session ended. <button onClick={handleNewSession}>Start new chat</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            type="text"
            placeholder={isDisconnected ? 'Session ended' : 'Type a message...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isDisconnected}
          />
          <button
            type="button"
            className={`chat-mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={handleMicToggle}
            disabled={isDisconnected}
            aria-label={isRecording ? 'Stop mic' : 'Start mic'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="1" width="6" height="12" rx="3" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <button type="submit" className="chat-send-btn" disabled={!input.trim() || isDisconnected}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>

      {open && <div className="chat-overlay" onClick={() => setOpen(false)} />}
    </>
  )
}
