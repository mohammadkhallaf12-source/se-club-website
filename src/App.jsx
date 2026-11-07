
import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import './App.css'

const SHEET_BASE =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3SEuQ4XJ8R9uS6Q4DAFXmTLzwVb4XrSPxSgVnVs3hITVMoD7w1B3pfP59uWdsY7FIFe_y0r8Odb5t/pub'

const EVENTS_URL = `${SHEET_BASE}?gid=0&single=true&output=csv`
const FORMS_URL = `${SHEET_BASE}?gid=200952066&single=true&output=csv`

const asset = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

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
    icon: 'instagram',
    url: 'https://www.instagram.com/se_club.asu',
  },
  {
    name: 'WhatsApp',
    icon: 'whatsapp',
    url: 'https://chat.whatsapp.com/DSWW1HzFPEn0UyRYrIGSly',
  },
  {
    name: 'Facebook',
    icon: 'facebook',
    url: 'https://www.facebook.com/share/19Viif1kv7/',
  },
]

function SocialIcon({ name }) {
  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    )
  }

  if (name === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20.3 11.6a8.3 8.3 0 0 1-12.2 7.3L3.5 20l1.2-4.4a8.3 8.3 0 1 1 15.6-4Z" />
        <path d="M8.5 8.1c-.4.3-.8 1-.7 1.7.2 1.7 2.5 4.4 4.7 5.5 1.2.6 2.3.7 3.1.1l.7-1.1-2.5-1.2-.9 1c-1.3-.5-2.5-1.7-3.1-3l.9-.9-1.3-2.4Z" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12a10 10 0 1 0-11.56 9.88V14.9H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.78-3.88 1.1 0 2.25.2 2.25.2v2.47H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.9h-2.33v7.1A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

function SocialLinks() {
  return (
    <div className="hero-socials">
      <p className="hero-socials-title">
        FOLLOW US & STAY CONNECTED
      </p>

      <div className="hero-social-icons">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`hero-social-circle social-${social.icon}`}
            aria-label={`Visit SE Club on ${social.name}`}
            title={social.name}
          >
            <SocialIcon name={social.icon} />
          </a>
        ))}
      </div>
    </div>
  )
}

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
        <div className="empty-state">
          Loading events...
        </div>
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

                <h3>
                  {event.title || 'Upcoming Event'}
                </h3>

                <p className="card-description">
                  {event.description || 'More details coming soon.'}
                </p>

                <div className="card-details">
                  {event.date && <p>📅 {event.date}</p>}
                  {event.time && <p>🕒 {event.time}</p>}
                  {event.location && <p>📍 {event.location}</p>}
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
                    {open
                      ? 'Registration Coming Soon'
                      : 'Registration Closed'}
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
        <div className="empty-state">
          Loading forms...
        </div>
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

                <h3>
                  {form.title || 'Application Form'}
                </h3>

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
                    {open
                      ? 'Link Coming Soon'
                      : 'Applications Closed'}
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

        <nav aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#events">Events</a>
          <a href="#forms">Forms</a>
          <a href="#team">Our Team</a>
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
            <a
              href="https://chat.whatsapp.com/DSWW1HzFPEn0UyRYrIGSly"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Our Community
            </a>

            <a href="#events">
              Explore Events
            </a>

            <a href="#forms">
              Explore Forms
            </a>
          </div>

          <SocialLinks />

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
              <article
                className="team-card"
                key={member.name}
              >
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
