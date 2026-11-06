
import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import './App.css'

const SHEET_BASE =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3SEuQ4XJ8R9uS6Q4DAFXmTLzwVb4XrSPxSgVnVs3hITVMoD7w1B3pfP59uWdsY7FIFe_y0r8Odb5t/pub'

const EVENTS_URL = `${SHEET_BASE}?gid=0&single=true&output=csv`
const FORMS_URL = `${SHEET_BASE}?gid=200952066&single=true&output=csv`

const asset = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

const teamMembers = [
  {
    name: 'Mohammad Khallaf',
    arabicName: 'محمد خلاف',
    role: 'Club Leader',
    image: 'team/mohammad.jpg',
  },
  {
    name: 'Yazan Alhaw',
    arabicName: 'يزن الحو',
    role: 'Co-Leader',
    image: 'team/yazan.jpg',
  },
  {
    name: 'Abdullah Mustafa',
    arabicName: 'عبدالله مصطفى',
    role: 'Design Leader',
    image: 'team/abdullah.jpg',
  },
  {
    name: 'Yara Al-Ramahi',
    arabicName: 'يارا الرمحي',
    role: 'Photography Leader',
    image: 'team/yara.jpg',
  },
  {
    name: 'Mayar Alramahi',
    arabicName: 'ميار الرمحي',
    role: 'Media Leader',
    image: 'team/mayar.jpg',
  },
  {
    name: 'Laith Jabari',
    arabicName: 'ليث الجعبري',
    role: 'Logistics Leader',
    image: 'team/laith.jpg',
  },
  {
    name: 'Thafer Khatib',
    arabicName: 'ظافر الخطيب',
    role: 'Public Relations Leader',
    image: 'team/thafer.jpg',
  },
]

const socialLinks = [
  {
    name: 'Instagram',
    description: 'Follow our latest updates',
    icon: '◎',
    url: 'https://www.instagram.com/se_club.asu',
  },
  {
    name: 'WhatsApp',
    description: 'Join our club community',
    icon: '✉',
    url: 'https://chat.whatsapp.com/DSWW1HzFPEn0UyRYrIGSly',
  },
  {
    name: 'Facebook',
    description: 'Stay connected with us',
    icon: 'f',
    url: 'https://www.facebook.com/share/19Viif1kv7/',
  },
]

function useSheet(url) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadData() {
      try {
        setLoading(true)
        setError(false)

        const response = await fetch(url, {
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Unable to load spreadsheet')
        }

        const csv = await response.text()

        const result = Papa.parse(csv.replace(/^\uFEFF/, ''), {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (header) => header.trim(),
        })

        const validRows = result.data.filter((row) =>
          Object.values(row).some((value) =>
            String(value ?? '').trim()
          )
        )

        if (!controller.signal.aborted) {
          setRows(validRows)
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Google Sheets error:', err)
          setError(true)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => controller.abort()
  }, [url])

  return { rows, loading, error }
}

function isOpen(status) {
  return String(status || '').trim().toLowerCase() === 'open'
}

function safeLink(value) {
  try {
    const url = new URL(String(value || '').trim())
    return ['https:', 'http:'].includes(url.protocol)
      ? url.href
      : null
  } catch {
    return null
  }
}

function EventsSection() {
  const { rows, loading, error } = useSheet(EVENTS_URL)

  return (
    <section id="events" className="content-section">
      <p className="section-label">WHAT'S NEXT?</p>

      <h2>
        Events & <span>Workshops</span>
      </h2>

      <p className="section-description">
        Discover our upcoming workshops, competitions, and events.
      </p>

      {loading && (
        <div className="empty-state">Loading events...</div>
      )}

      {error && (
        <div className="empty-state">
          Unable to load events right now. Please try again later.
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="empty-state">
          New events will be announced soon.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="content-grid">
          {rows.map((event, index) => {
            const open = isOpen(event.status)
            const link = safeLink(event.registrationLink)

            return (
              <article className="content-card" key={index}>
                <div className="card-top">
                  <span className="category-tag">
                    {event.type || 'Event'}
                  </span>

                  <span
                    className={`status-tag ${
                      open ? 'status-open' : 'status-closed'
                    }`}
                  >
                    {open ? 'Open' : 'Closed'}
                  </span>
                </div>

                <h3>{event.title || 'Upcoming Event'}</h3>

                <p className="card-description">
                  {event.description || 'More details coming soon.'}
                </p>

                <div className="card-details">
                  {event.date && (
                    <p>📅 {event.date}</p>
                  )}

                  {event.time && (
                    <p>🕒 {event.time}</p>
                  )}

                  {event.location && (
                    <p>📍 {event.location}</p>
                  )}
                </div>

                {open && link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-button"
                  >
                    Register Now ↗
                  </a>
                ) : (
                  <span className="card-button disabled-button">
                    {open ? 'Registration Coming Soon' : 'Registration Closed'}
                  </span>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function FormsSection() {
  const { rows, loading, error } = useSheet(FORMS_URL)

  return (
    <section id="forms" className="content-section">
      <p className="section-label">GET INVOLVED</p>

      <h2>
        Forms & <span>Applications</span>
      </h2>

      <p className="section-description">
        Register, apply, and become part of our community.
      </p>

      {loading && (
        <div className="empty-state">Loading forms...</div>
      )}

      {error && (
        <div className="empty-state">
          Unable to load forms right now. Please try again later.
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="empty-state">
          No forms are available at the moment.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="content-grid">
          {rows.map((form, index) => {
            const open = isOpen(form.status)
            const link = safeLink(form.formLink)

            return (
              <article className="content-card" key={index}>
                <div className="card-top">
                  <span className="category-tag">
                    {form.category || 'Application'}
                  </span>

                  <span
                    className={`status-tag ${
                      open ? 'status-open' : 'status-closed'
                    }`}
                  >
                    {open ? 'Open' : 'Closed'}
                  </span>
                </div>

                <h3>{form.title || 'Application Form'}</h3>

                <p className="card-description">
                  {form.description || 'More information coming soon.'}
                </p>

                {form.deadline && (
                  <div className="card-details">
                    <p>📅 Deadline: {form.deadline}</p>
                  </div>
                )}

                {open && link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-button"
                  >
                    Open Form ↗
                  </a>
                ) : (
                  <span className="card-button disabled-button">
                    {open ? 'Link Coming Soon' : 'Applications Closed'}
                  </span>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function App() {
  return (
    <div className="website" id="home">
      <header className="navbar">
        <a href="#home" aria-label="SE Club Home">
          <img
            src={asset('logo.jpeg')}
            alt="SE Club Logo"
            className="club-logo"
          />
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#events">Events</a>
          <a href="#forms">Forms</a>
          <a href="#team">Our Team</a>
          <a href="#contact">Connect</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <p className="tagline">
            APPLIED SCIENCE PRIVATE UNIVERSITY
          </p>

          <h1>
            Software Engineering <span>Club.</span>
          </h1>

          <p className="hero-description">
            Where Ideas Become Reality.
          </p>

          <div className="buttons">
            <a href="#events">Explore Events</a>
            <a href="#forms">Explore Forms</a>
          </div>

          <div className="hero-scroll">
            SCROLL TO EXPLORE ↓
          </div>
        </section>

        <EventsSection />

        <FormsSection />

        <section id="team" className="content-section">
          <p className="section-label">
            THE PEOPLE BEHIND SE CLUB
          </p>

          <h2>
            Meet Our <span>Core Team</span>
          </h2>

          <p className="section-description">
            Meet the people working together to make things happen.
          </p>

          <div className="team-grid">
            {teamMembers.map((member) => (
              <article className="team-card" key={member.name}>
                <img
                  src={asset(member.image)}
                  alt={`${member.name} - ${member.role}`}
                  className="team-poster"
                  loading="lazy"
                />

                <div className="team-info">
                  <span className="team-role">
                    {member.role}
                  </span>

                  <h3>{member.name}</h3>

                  <p lang="ar" dir="rtl">
                    {member.arabicName}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="content-section">
          <p className="section-label">STAY CONNECTED</p>

          <h2>
            Connect With <span>SE Club</span>
          </h2>

          <p className="section-description">
            All our official links in one place.
          </p>

          <div className="social-grid">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-card"
              >
                <div className="social-icon">
                  {social.icon}
                </div>

                <div className="social-info">
                  <h3>{social.name}</h3>
                  <p>{social.description}</p>
                </div>

                <span className="social-arrow">↗</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <img
            src={asset('logo.jpeg')}
            alt="SE Club"
            className="footer-logo"
          />

          <span>Software Engineering Club</span>
        </div>

        <p>Applied Science Private University</p>

        <p>
          © {new Date().getFullYear()} SE Club.
          All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}

export default App
