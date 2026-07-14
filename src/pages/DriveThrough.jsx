import './DriveThrough.css'

export default function DriveThrough() {
  return (
    <div className="dt-page">
      <div className="dt-container">
        <div className="dt-icon">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="28" width="52" height="20" rx="6" fill="var(--color-secondary)" />
            <rect x="10" y="24" width="44" height="10" rx="4" fill="var(--color-text-secondary)" />
            <circle cx="18" cy="50" r="5" fill="var(--color-secondary)" stroke="var(--color-accent)" strokeWidth="2" />
            <circle cx="46" cy="50" r="5" fill="var(--color-secondary)" stroke="var(--color-accent)" strokeWidth="2" />
            <rect x="14" y="31" width="12" height="7" rx="2" fill="var(--color-accent)" opacity="0.8" />
            <rect x="38" y="31" width="12" height="7" rx="2" fill="var(--color-accent)" opacity="0.8" />
            <rect x="28" y="31" width="8" height="7" rx="2" fill="var(--color-primary)" />
          </svg>
        </div>
        <h1 className="dt-title">AI DRIVE-THROUGH</h1>
        <p className="dt-subtitle">Experience the Fast X Food voice-powered drive-through — right from your browser.</p>
        <div className="dt-description">
          <p>
            Our AI drive-through agent takes your order by voice, just like pulling up to the window.
            Say what you want, customize your meal, ask about allergens or calories, and it handles the rest.
          </p>
          <p>
            Built on Google CX Agent Studio with real-time voice streaming. The full interactive
            experience is coming to this page soon.
          </p>
        </div>
        <div className="dt-badge">Coming Soon</div>
      </div>
    </div>
  )
}
