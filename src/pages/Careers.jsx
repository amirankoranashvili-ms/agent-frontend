import './Careers.css'

const JOBS = [
  {
    title: 'Crew Member',
    location: 'All Locations',
    type: 'Full-Time / Part-Time',
    description: 'Take orders, prep food, keep the line moving. No experience needed — we train from day one. Flexible hours, free meals on shift, and a team that actually has your back.',
  },
  {
    title: 'Shift Lead',
    location: 'Austin, TX · Denver, CO',
    type: 'Full-Time',
    description: 'Run the floor during your shift. You manage the crew, handle the rush, and make sure every order goes out right. 1+ year in food service preferred. Leadership training included.',
  },
  {
    title: 'Kitchen Manager',
    location: 'Austin, TX',
    type: 'Full-Time',
    description: 'Own the kitchen — inventory, food quality, safety standards, team scheduling. You keep the grill hot and the standards high. 2+ years kitchen management experience.',
  },
  {
    title: 'Drive-Through Specialist',
    location: 'All Locations',
    type: 'Full-Time / Part-Time',
    description: 'You\'re the voice of Fast X Food. Take orders at the window, keep the line fast, make every customer feel welcome. Great communication skills and a calm head during the rush.',
  },
  {
    title: 'Marketing Coordinator',
    location: 'Remote',
    type: 'Full-Time',
    description: 'Help us tell the Fast X Food story. Social media, local promos, new location launches, seasonal campaigns. You know what makes people hungry and how to reach them.',
  },
  {
    title: 'Software Engineer',
    location: 'Remote',
    type: 'Full-Time',
    description: 'Build the tech behind our ordering systems, loyalty platform, and AI-powered drive-through. Python, cloud infrastructure, API design. We move fast and ship often.',
  },
]

export default function Careers() {
  return (
    <div className="careers-page">
      <div className="careers-hero">
        <h1 className="careers-title">WE FLIP BURGERS, NOT TABLES.</h1>
        <p className="careers-subtitle">Come work with us. Good food, good people, no corporate nonsense.</p>
      </div>

      <section className="careers-perks">
        <div className="perks-inner">
          <div className="perk">
            <span className="perk-icon">$</span>
            <h3>Competitive Pay</h3>
            <p>Above-market wages at every level. We don't do "exposure" — we do direct deposit.</p>
          </div>
          <div className="perk">
            <span className="perk-icon">&</span>
            <h3>Free Meals</h3>
            <p>Every shift comes with a free meal. You're making the food — you should eat it too.</p>
          </div>
          <div className="perk">
            <span className="perk-icon">^</span>
            <h3>Growth Path</h3>
            <p>Crew to shift lead to manager. We promote from within and train you to get there.</p>
          </div>
          <div className="perk">
            <span className="perk-icon">~</span>
            <h3>Flexible Schedule</h3>
            <p>Morning, evening, weekends — we work with your life, not against it.</p>
          </div>
        </div>
      </section>

      <section className="careers-listings">
        <div className="listings-inner">
          <h2 className="section-title-center">OPEN POSITIONS</h2>
          <div className="jobs-list">
            {JOBS.map((job, i) => (
              <div className="job-card" key={i}>
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <div className="job-meta">
                    <span>{job.location}</span>
                    <span className="job-dot">&middot;</span>
                    <span>{job.type}</span>
                  </div>
                  <p>{job.description}</p>
                </div>
                <button className="job-apply" onClick={() => alert('This is a demo — no real applications are accepted.')}>
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
