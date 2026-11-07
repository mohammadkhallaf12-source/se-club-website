
import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import './App.css'

const SHEET_BASE =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3SEuQ4XJ8R9uS6Q4DAFXmTLzwVb4XrSPxSgVnVs3hITVMoD7w1B3pfP59uWdsY7FIFe_y0r8Odb5t/pub'

const EVENTS_URL = `${SHEET_BASE}?gid=0&single=true&output=csv`
const FORMS_URL = `${SHEET_BASE}?gid=200952066&single=true&output=csv`
const GALLERY_URL = `${SHEET_BASE}?gid=86421599&single=true&output=csv`
const COMPETITIONS_URL = `${SHEET_BASE}?gid=310065857&single=true&output=csv`
const WINNERS_URL = `${SHEET_BASE}?gid=1463457444&single=true&output=csv`

const REPO_OWNER = 'mohammadkhallaf12-source'
const REPO_NAME = 'se-club-website'

const asset = (path) =>
  `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`

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
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
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
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88V14.9H7.9V12h2.54V9.8c0-2.5 1.5-3.88 3.78-3.88 1.1 0 2.25.2 2.25.2v2.47H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.9h-2.33v7.1A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

function SocialLinks() {
  return (
    <div className="hero-socials">
      <p className="hero-socials-title">FOLLOW US & STAY CONNECTED</p>
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

function useRepositoryImages() {
  const [files, setFiles] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadFiles() {
      try {
        const repoResponse = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
          { signal: controller.signal }
        )

        if (!repoResponse.ok) {
          throw new Error('Repository unavailable')
        }

        const repo = await repoResponse.json()
        const branch = encodeURIComponent(repo.default_branch)

        const treeResponse = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${branch}?recursive=1`,
          { signal: controller.signal }
        )

        if (!treeResponse.ok) {
          throw new Error('Unable to load image list')
        }

        const tree = await treeResponse.json()

        if (tree.truncated) {
          throw new Error('Repository image list is incomplete')
        }

        if (!controller.signal.aborted) {
          setFiles(
            (tree.tree || [])
              .filter((item) =>
                item.type === 'blob' &&
                /^public\/(gallery|competitions)\//i.test(item.path) &&
                /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(item.path)
              )
              .map((item) => item.path.replace(/^public\//, ''))
          )
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('GitHub images error:', err)
          setError(true)
        }
      }
    }

    loadFiles()
    return () => controller.abort()
  }, [])

  return { files, error }
}

function imagesInFolder(files, section, folderName) {
  const folder = String(folderName || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')

  if (
    !folder ||
    folder === '.' ||
    folder === '..' ||
    folder.includes('/') ||
    folder.includes('\\')
  ) {
    return []
  }

  const prefix = `${section}/${folder}/`

  return files
    .filter((file) => file.startsWith(prefix))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map(asset)
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

function DataState({ loading, error, empty, children }) {
  if (loading) {
    return <div className="empty-state">Loading...</div>
  }

  if (error) {
    return (
      <div className="empty-state">
        Unable to load content right now. Please try again later.
      </div>
    )
  }

  if (empty) {
    return <div className="empty-state">More updates coming soon.</div>
  }

  return children
}

function EventsSection() {
  const { rows, loading, error } = useSheet(EVENTS_URL)

  return (
    <section id="events" className="content-section">
      <p className="section-label">WHAT'S NEXT?</p>
      <h2>Events & <span>Workshops</span></h2>
      <p className="section-description">
        Discover our upcoming workshops, competitions, and events.
      </p>

      <DataState loading={loading} error={error} empty={!rows.length}>
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
                  <span className={`status-tag ${open ? 'status-open' : 'status-closed'}`}>
                    {open ? 'Open' : 'Closed'}
                  </span>
                </div>

                <h3>{event.title || 'Upcoming Event'}</h3>
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
                    {open ? 'Registration Coming Soon' : 'Registration Closed'}
                  </span>
                )}
              </article>
            )
          })}
        </div>
      </DataState>
    </section>
  )
}

function FormsSection() {
  const { rows, loading, error } = useSheet(FORMS_URL)

  return (
    <section id="forms" className="content-section">
      <p className="section-label">GET INVOLVED</p>
      <h2>Forms & <span>Applications</span></h2>
      <p className="section-description">
        Register, apply, and become part of our community.
      </p>

      <DataState loading={loading} error={error} empty={!rows.length}>
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
                  <span className={`status-tag ${open ? 'status-open' : 'status-closed'}`}>
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
      </DataState>
    </section>
  )
}

function YearFilter({ rows, year, onChange }) {
  const years = [...new Set(
    rows.map((row) => String(row.academicYear || '').trim()).filter(Boolean)
  )].sort((a, b) => b.localeCompare(a))

  return (
    <div className="year-filter">
      <label htmlFor={`year-${years.join('-')}`}>
        Academic Year
      </label>
      <select
        id={`year-${years.join('-')}`}
        value={year}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">All Years</option>
        {years.map((item) => (
          <option value={item} key={item}>{item}</option>
        ))}
      </select>
    </div>
  )
}

function ImageSlider({ images, title }) {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const count = images.length

  useEffect(() => {
    setIndex(0)
  }, [images.join('|')])

  useEffect(() => {
    if (count < 2 || expanded) return

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, 4000)

    return () => clearInterval(timer)
  }, [count, expanded])

  useEffect(() => {
    if (!expanded) return

    function handleKey(event) {
      if (event.key === 'Escape') setExpanded(false)
      if (event.key === 'ArrowRight' && count > 1) {
        setIndex((current) => (current + 1) % count)
      }
      if (event.key === 'ArrowLeft' && count > 1) {
        setIndex((current) => (current - 1 + count) % count)
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [expanded, count])

  if (!count) {
    return (
      <div className="gallery-placeholder">
        <span className="placeholder-symbol">✦</span>
        <span>Photos Coming Soon</span>
      </div>
    )
  }

  const previous = () =>
    setIndex((current) => (current - 1 + count) % count)

  const next = () =>
    setIndex((current) => (current + 1) % count)

  return (
    <>
      <div className="image-slider">
        <button
          type="button"
          className="image-open"
          onClick={() => setExpanded(true)}
          aria-label={`Enlarge photo of ${title}`}
        >
          <img src={images[index]} alt={`${title} - photo ${index + 1}`} />
          <span className="zoom-hint">⤢ View Photo</span>
        </button>

        {count > 1 && (
          <>
            <button
              className="slide-arrow slide-prev"
              onClick={previous}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              className="slide-arrow slide-next"
              onClick={next}
              aria-label="Next photo"
            >
              ›
            </button>
            <div className="slide-count">{index + 1} / {count}</div>
          </>
        )}
      </div>

      {expanded && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
          onClick={() => setExpanded(false)}
        >
          <button
            className="lightbox-close"
            onClick={() => setExpanded(false)}
            aria-label="Close photo"
          >
            ×
          </button>

          {count > 1 && (
            <button
              className="lightbox-arrow"
              onClick={(event) => {
                event.stopPropagation()
                previous()
              }}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <img
            src={images[index]}
            alt={`${title} - photo ${index + 1}`}
            onClick={(event) => event.stopPropagation()}
          />

          {count > 1 && (
            <button
              className="lightbox-arrow"
              onClick={(event) => {
                event.stopPropagation()
                next()
              }}
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  )
}

function GallerySection({ imageFiles, imageError }) {
  const { rows, loading, error } = useSheet(GALLERY_URL)
  const [year, setYear] = useState('all')

  const visible = rows.filter(
    (item) => year === 'all' || item.academicYear === year
  )

  return (
    <section id="gallery" className="content-section">
      <p className="section-label">MOMENTS THAT MATTER</p>
      <h2>Our <span>Journey</span></h2>
      <p className="section-description">
        A look back at our workshops, activities, and memorable moments.
      </p>

      <DataState loading={loading} error={error} empty={!rows.length}>
        <YearFilter rows={rows} year={year} onChange={setYear} />

        {imageError && (
          <p className="image-warning">
            Some photos could not be loaded right now.
          </p>
        )}

        {visible.length ? (
          <div className="archive-grid">
            {visible.map((item, index) => (
              <article className="archive-card" key={`${item.eventId}-${index}`}>
                <ImageSlider
                  images={imagesInFolder(imageFiles, 'gallery', item.folderName)}
                  title={item.eventTitle || 'Event'}
                />
                <div className="archive-body">
                  <div className="archive-meta">
                    <span>{item.category || 'Event'}</span>
                    <span>{item.academicYear}</span>
                  </div>
                  <h3>{item.eventTitle || 'Club Activity'}</h3>
                  {item.date && <p className="archive-date">📅 {item.date}</p>}
                  {item.description && (
                    <p className="archive-description">{item.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">No activities for this year yet.</div>
        )}
      </DataState>
    </section>
  )
}

function WinnersList({ winners }) {
  if (!winners.length) {
    return <p className="winners-empty">Winning teams will be announced here.</p>
  }

  return (
    <div className="winners-list">
      {winners.map((winner, index) => {
        const position = Number(winner.position)
        const place = position === 1
          ? '1ST PLACE'
          : position === 2
            ? '2ND PLACE'
            : position === 3
              ? '3RD PLACE'
              : `${winner.position}TH PLACE`

        const names = String(winner.studentNames || '')
          .split(/[,|;\n]+/)
          .map((name) => name.trim())
          .filter(Boolean)

        return (
          <div
            className={`winner-item winner-place-${position}`}
            key={`${winner.teamName}-${index}`}
          >
            <div className="winner-heading">
              <span className="winner-medal">
                {position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏅'}
              </span>
              <span className="winner-position">{place}</span>
            </div>
            <h4>{winner.teamName || 'Winning Team'}</h4>
            {names.length > 0 && (
              <p className="winner-students">{names.join(' • ')}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function CompetitionsSection({ imageFiles, imageError }) {
  const competitions = useSheet(COMPETITIONS_URL)
  const winners = useSheet(WINNERS_URL)
  const [year, setYear] = useState('all')

  const visible = competitions.rows.filter(
    (item) => year === 'all' || item.academicYear === year
  )

  return (
    <section id="hall-of-fame" className="content-section">
      <p className="section-label">CELEBRATING ACHIEVEMENT</p>
      <h2>Hall of <span>Fame</span></h2>
      <p className="section-description">
        Celebrating the competitions, teamwork, and achievements of our students.
      </p>

      <DataState
        loading={competitions.loading || winners.loading}
        error={competitions.error || winners.error}
        empty={!competitions.rows.length}
      >
        <YearFilter
          rows={competitions.rows}
          year={year}
          onChange={setYear}
        />

        {imageError && (
          <p className="image-warning">
            Some photos could not be loaded right now.
          </p>
        )}

        {visible.length ? (
          <div className="archive-grid">
            {visible.map((competition, index) => {
              const matchingWinners = winners.rows
                .filter((winner) =>
                  String(winner.competitionId || '').trim() ===
                  String(competition.competitionId || '').trim()
                )
                .sort(
                  (a, b) =>
                    (Number(a.position) || 999) -
                    (Number(b.position) || 999)
                )

              return (
                <article
                  className="archive-card competition-card"
                  key={`${competition.competitionId}-${index}`}
                >
                  <ImageSlider
                    images={imagesInFolder(
                      imageFiles,
                      'competitions',
                      competition.folderName
                    )}
                    title={competition.competitionName || 'Competition'}
                  />

                  <div className="archive-body">
                    <div className="archive-meta">
                      <span>Competition</span>
                      <span>{competition.academicYear}</span>
                    </div>
                    <h3>{competition.competitionName || 'Competition'}</h3>

                    {competition.date && (
                      <p className="archive-date">📅 {competition.date}</p>
                    )}

                    {competition.description && (
                      <p className="archive-description">
                        {competition.description}
                      </p>
                    )}

                    <div className="competition-divider" />
                    <h4 className="winners-title">Winning Teams</h4>
                    <WinnersList winners={matchingWinners} />
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">No competitions for this year yet.</div>
        )}
      </DataState>
    </section>
  )
}

function TeamSection() {
  const [selected, setSelected] = useState(0)
  const member = teamMembers[selected]

  return (
    <section id="team" className="content-section team-section">
      <p className="section-label">THE PEOPLE BEHIND SE CLUB</p>
      <h2>Meet Our <span>Core Team</span></h2>
      <p className="section-description">
        Meet the people working together to make things happen.
      </p>

      <div className="team-showcase">
        <div className="team-featured">
          <div className="team-featured-photo">
            <img
              src={asset(member.image)}
              alt={`${member.name} - ${member.role}`}
              key={member.image}
            />
          </div>

          <div className="team-featured-content">
            <span className="team-featured-eyebrow">SE CLUB CORE TEAM</span>
            <span className="team-featured-number">
              {String(selected + 1).padStart(2, '0')} / {String(teamMembers.length).padStart(2, '0')}
            </span>

            <span className="team-featured-role">{member.role}</span>
            <h3>{member.name}</h3>
            <p className="team-featured-arabic" lang="ar" dir="rtl">
              {member.arabicName}
            </p>

            <div className="team-featured-line" />

            <p className="team-featured-caption">
              The people making it happen.
            </p>

            <div className="team-featured-navigation">
              <button
                type="button"
                onClick={() =>
                  setSelected((current) =>
                    (current - 1 + teamMembers.length) % teamMembers.length
                  )
                }
                aria-label="Previous team member"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelected((current) =>
                    (current + 1) % teamMembers.length
                  )
                }
                aria-label="Next team member"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <p className="team-selector-title">EXPLORE THE TEAM</p>

        <div className="team-selector">
          {teamMembers.map((person, index) => (
            <button
              type="button"
              className={`team-selector-item ${selected === index ? 'active' : ''}`}
              key={person.name}
              onClick={() => setSelected(index)}
              aria-label={`Show ${person.name}`}
              aria-pressed={selected === index}
            >
              <img src={asset(person.image)} alt="" loading="lazy" />
              <span>{person.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function App() {
  const { files: imageFiles, error: imageError } = useRepositoryImages()

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
          <a href="#gallery">Our Journey</a>
          <a href="#hall-of-fame">Hall of Fame</a>
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
            <a href="#events">Explore Events</a>
            <a href="#forms">Explore Forms</a>
          </div>

          <SocialLinks />

          <div className="hero-scroll">
            SCROLL TO EXPLORE ↓
          </div>
        </section>

        <EventsSection />
        <FormsSection />
        <GallerySection imageFiles={imageFiles} imageError={imageError} />
        <CompetitionsSection imageFiles={imageFiles} imageError={imageError} />
        <TeamSection />
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
