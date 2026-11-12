
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Papa from 'papaparse'
import './App.css'

// GOOGLE SHEETS
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

// CORE TEAM
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

// SOCIAL ICONS
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
        FOLLOW US &amp; STAY CONNECTED
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

// GOOGLE SHEETS READER
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

        const parsed = Papa.parse(csv.replace(/^\uFEFF/, ''), {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (header) => header.trim(),
        })

        const validRows = parsed.data.filter((row) =>
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

// GET PHOTOS FROM GITHUB
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
              .filter(
                (item) =>
                  item.type === 'blob' &&
                  /^public\/(gallery|competitions)\//i.test(item.path) &&
                  /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(item.path)
              )
              .map((item) =>
                item.path.replace(/^public\//, '')
              )
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
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    )
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
    return (
      <div className="empty-state">
        More updates coming soon.
      </div>
    )
  }

  return children
}

// HORIZONTAL SCROLLER WITH ARROWS
function HorizontalScroller({
  children,
  className,
  label,
  count,
  pageByView = false,
}) {
  const ref = useRef(null)

  const [edges, setEdges] = useState({
    left: false,
    right: false,
  })

  useEffect(() => {
    const node = ref.current
    if (!node) return

    function update() {
      const max = Math.max(
        0,
        node.scrollWidth - node.clientWidth
      )

      setEdges({
        left: node.scrollLeft > 4,
        right: node.scrollLeft < max - 4,
      })
    }

    node.addEventListener('scroll', update, {
      passive: true,
    })

    window.addEventListener('resize', update)

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(update)
        : null

    observer?.observe(node)
    update()

    return () => {
      node.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      observer?.disconnect()
    }
  }, [count])

  function move(direction) {
    const node = ref.current
    if (!node) return

    const card = node.firstElementChild

    const cardWidth =
      card?.getBoundingClientRect().width ||
      node.clientWidth

    const gap =
      parseFloat(
        window.getComputedStyle(node).columnGap
      ) || 0

    const step = cardWidth + gap

    const visible = Math.max(
      1,
      Math.round((node.clientWidth + gap) / step)
    )

    const group = pageByView ? visible : 1
    const currentCard = Math.round(node.scrollLeft / step)

    const currentGroup =
      direction < 0
        ? Math.ceil(currentCard / group)
        : Math.floor(currentCard / group)

    const nextGroup = Math.max(
      0,
      currentGroup + direction
    )

    const target = nextGroup * group * step

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    node.scrollTo({
      left: Math.max(
        0,
        Math.min(
          target,
          node.scrollWidth - node.clientWidth
        )
      ),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <div className="horizontal-carousel">
      <button
        type="button"
        className="carousel-arrow carousel-arrow-left"
        aria-label={`Previous ${label}`}
        disabled={!edges.left}
        onClick={() => move(-1)}
      >
        ‹
      </button>

      <div
        ref={ref}
        className={className}
        aria-label={label}
      >
        {children}
      </div>

      <button
        type="button"
        className="carousel-arrow carousel-arrow-right"
        aria-label={`Next ${label}`}
        disabled={!edges.right}
        onClick={() => move(1)}
      >
        ›
      </button>
    </div>
  )
}

// SMART GALLERY SEARCH
function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
}

function closeWords(a, b) {
  if (Math.abs(a.length - b.length) > 2) {
    return false
  }

  const max = a.length >= 6 ? 2 : 1

  const previous = Array.from(
    { length: b.length + 1 },
    (_, i) => i
  )

  for (let i = 1; i <= a.length; i++) {
    let left = i

    for (let j = 1; j <= b.length; j++) {
      const next = Math.min(
        previous[j] + 1,
        left + 1,
        previous[j - 1] +
          (a[i - 1] === b[j - 1] ? 0 : 1)
      )

      previous[j - 1] = left
      left = next
    }

    previous[b.length] = left
  }

  return previous[b.length] <= max
}

function searchScore(item, query) {
  const title = normalizeSearch(item.title)

  const details = normalizeSearch(
    `${item.description} ${item.category} ${item.date}`
  )

  if (title === query) return 120
  if (title.startsWith(query)) return 105
  if (title.includes(query)) return 90

  const words = title.split(' ').filter(Boolean)

  if (words.some((word) => word.startsWith(query))) {
    return 80
  }

  const queryWords = query.split(' ')

  if (
    queryWords.every((word) =>
      words.some((titleWord) =>
        titleWord.startsWith(word)
      )
    )
  ) {
    return 70
  }

  if (details.includes(query)) return 40

  if (
    query.length >= 4 &&
    words.some((word) => closeWords(query, word))
  ) {
    return 26
  }

  return 0
}

// OUR VISION
function VisionSection() {
  return (
    <section
      id="vision"
      className="content-section vision-section"
      aria-labelledby="vision-title"
    >
      <div className="vision-panel">
        <div
          className="vision-decoration"
          aria-hidden="true"
        >
          ✦
        </div>

        <p className="section-label">
          OUR PURPOSE &amp; DIRECTION
        </p>

        <h2 id="vision-title">
          Our <span>Vision</span>
        </h2>

        <p className="vision-english">
          To build an inspiring and collaborative community
          where students across the Faculty of Information
          Technology can grow beyond the classroom, develop
          practical skills, and turn their knowledge into
          real-world experience. Through engaging workshops,
          meaningful competitions, and opportunities for
          teamwork and innovation, we aim to empower students,
          encourage creativity, and prepare future software
          engineers to make a positive impact in the
          technology world.
        </p>

        <div
          className="vision-divider"
          aria-hidden="true"
        >
          <span>✦</span>
        </div>

        <h3 lang="ar" dir="rtl">
          رؤيتنا
        </h3>

        <p
          className="vision-arabic"
          lang="ar"
          dir="rtl"
        >
          نسعى إلى بناء مجتمع طلابي ملهم ومتعاون، يتيح لجميع
          طلبة كلية تكنولوجيا المعلومات تطوير مهاراتهم خارج
          القاعات الدراسية، وتحويل معارفهم الأكاديمية إلى
          خبرات عملية حقيقية. ومن خلال الورشات التدريبية
          والمسابقات الهادفة وفرص العمل الجماعي والابتكار،
          نطمح إلى تمكين الطلبة، وتعزيز روح الإبداع لديهم،
          وإعداد مهندسي برمجيات قادرين على إحداث أثر إيجابي
          في عالم التكنولوجيا.
        </p>
      </div>
    </section>
  )
}

// UPCOMING EVENTS
function EventsSection({ data }) {
  const { rows, loading, error } = data

  return (
    <section
      id="events"
      className="content-section"
    >
      <p className="section-label">
        WHAT'S NEXT?
      </p>

      <h2>
        Events &amp; <span>Workshops</span>
      </h2>

      <p className="section-description">
        Discover our upcoming workshops,
        competitions, and events.
      </p>

      <DataState
        loading={loading}
        error={error}
        empty={!rows.length}
      >
        <HorizontalScroller
          className="content-grid"
          label="events"
          count={rows.length}
        >
          {rows.map((event, index) => {
            const open = isOpen(event.status)
            const link = safeLink(event.registrationLink)

            return (
              <article
                className="content-card"
                key={index}
              >
                <div className="card-top">
                  <span className="category-tag">
                    {event.type || 'Event'}
                  </span>

                  <span
                    className={`status-tag ${
                      open
                        ? 'status-open'
                        : 'status-closed'
                    }`}
                  >
                    {open ? 'Open' : 'Closed'}
                  </span>
                </div>

                <h3>
                  {event.title || 'Upcoming Event'}
                </h3>

                <p className="card-description">
                  {event.description ||
                    'More details coming soon.'}
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
                    {open
                      ? 'Registration Coming Soon'
                      : 'Registration Closed'}
                  </span>
                )}
              </article>
            )
          })}
        </HorizontalScroller>
      </DataState>
    </section>
  )
}

// APPLICATION FORMS
function FormsSection({ data }) {
  const { rows, loading, error } = data

  return (
    <section
      id="forms"
      className="content-section"
    >
      <p className="section-label">
        GET INVOLVED
      </p>

      <h2>
        Forms &amp; <span>Applications</span>
      </h2>

      <p className="section-description">
        Register, apply, and become part of our community.
      </p>

      <DataState
        loading={loading}
        error={error}
        empty={!rows.length}
      >
        <div className="content-grid">
          {rows.map((form, index) => {
            const open = isOpen(form.status)
            const link = safeLink(form.formLink)

            return (
              <article
                className="content-card"
                key={index}
              >
                <div className="card-top">
                  <span className="category-tag">
                    {form.category || 'Application'}
                  </span>

                  <span
                    className={`status-tag ${
                      open
                        ? 'status-open'
                        : 'status-closed'
                    }`}
                  >
                    {open ? 'Open' : 'Closed'}
                  </span>
                </div>

                <h3>
                  {form.title || 'Application Form'}
                </h3>

                <p className="card-description">
                  {form.description ||
                    'More information coming soon.'}
                </p>

                {form.deadline && (
                  <div className="card-details">
                    <p>
                      📅 Deadline: {form.deadline}
                    </p>
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
      </DataState>
    </section>
  )
}

// ACADEMIC YEAR FILTER
function YearFilter({
  rows,
  year,
  onChange,
  id,
}) {
  const years = [
    ...new Set(
      rows
        .map((row) =>
          String(row.academicYear || '').trim()
        )
        .filter(Boolean)
    ),
  ].sort((a, b) =>
    b.localeCompare(a)
  )

  return (
    <div className="year-filter">
      <label htmlFor={id}>
        Academic Year
      </label>

      <select
        id={id}
        value={year}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="all">
          All Years
        </option>

        {years.map((item) => (
          <option
            value={item}
            key={item}
          >
            {item}
          </option>
        ))}
      </select>
    </div>
  )
}

// FIXED PHOTO SLIDER AND LIGHTBOX
function ImageSlider({ images, title }) {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const closeButtonRef = useRef(null)

  const count = images.length
  const current = count ? index % count : 0

  useEffect(() => {
    if (!expanded) return

    const focusedBeforeOpening =
      document.activeElement

    const oldOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    closeButtonRef.current?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setExpanded(false)
      }

      if (
        event.key === 'ArrowRight' &&
        count > 1
      ) {
        setIndex((i) =>
          (i + 1) % count
        )
      }

      if (
        event.key === 'ArrowLeft' &&
        count > 1
      ) {
        setIndex((i) =>
          (i - 1 + count) % count
        )
      }
    }

    document.addEventListener(
      'keydown',
      onKeyDown
    )

    return () => {
      document.body.style.overflow =
        oldOverflow

      document.removeEventListener(
        'keydown',
        onKeyDown
      )

      if (
        focusedBeforeOpening?.isConnected
      ) {
        focusedBeforeOpening.focus()
      }
    }
  }, [expanded, count])

  useEffect(() => {
    if (count < 2 || expanded) {
      return
    }

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

    if (reducedMotion) return

    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setIndex((i) =>
          (i + 1) % count
        )
      }
    }, 4000)

    return () =>
      window.clearInterval(timer)
  }, [count, expanded])

  if (!count) {
    return (
      <div className="gallery-placeholder">
        <span
          className="placeholder-symbol"
          aria-hidden="true"
        >
          ✦
        </span>

        <span>
          Photos Coming Soon
        </span>
      </div>
    )
  }

  const previous = () =>
    setIndex((i) =>
      (i - 1 + count) % count
    )

  const next = () =>
    setIndex((i) =>
      (i + 1) % count
    )

  return (
    <>
      <div className="image-slider">
        <button
          type="button"
          className="image-open"
          onClick={() =>
            setExpanded(true)
          }
          aria-label={`Enlarge photo of ${title}`}
        >
          <img
            src={images[current]}
            alt={`${title} - photo ${current + 1}`}
            loading="lazy"
          />

          <span className="zoom-hint">
            ⤢ View Photo
          </span>
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              className="slide-arrow slide-prev"
              onClick={previous}
              aria-label="Previous photo"
            >
              ‹
            </button>

            <button
              type="button"
              className="slide-arrow slide-next"
              onClick={next}
              aria-label="Next photo"
            >
              ›
            </button>

            <span className="slide-count">
              {current + 1} / {count}
            </span>
          </>
        )}
      </div>

      {expanded &&
        createPortal(
          <div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} photos`}
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setExpanded(false)
              }
            }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="lightbox-close"
              onClick={() =>
                setExpanded(false)
              }
              aria-label="Close photo"
            >
              ×
            </button>

            {count > 1 && (
              <button
                type="button"
                className="lightbox-arrow lightbox-prev"
                onClick={previous}
                aria-label="Previous enlarged photo"
              >
                ‹
              </button>
            )}

            <img
              className="lightbox-image"
              src={images[current]}
              alt={`${title} - photo ${current + 1}`}
            />

            {count > 1 && (
              <button
                type="button"
                className="lightbox-arrow lightbox-next"
                onClick={next}
                aria-label="Next enlarged photo"
              >
                ›
              </button>
            )}

            {count > 1 && (
              <span className="lightbox-counter">
                {current + 1} / {count}
              </span>
            )}
          </div>,
          document.body
        )}
    </>
  )
}

// OUR JOURNEY WITH SEARCH
function GallerySection({
  imageFiles,
  imageError,
  data,
}) {
  const {
    rows,
    loading,
    error,
  } = data

  const [year, setYear] = useState('all')
  const [query, setQuery] = useState('')

  const normalizedQuery =
    normalizeSearch(query)

  const visible = useMemo(() => {
    return rows
      .filter(
        (item) =>
          year === 'all' ||
          item.academicYear === year
      )
      .map((item) => ({
        item,
        score: normalizedQuery
          ? searchScore(
              {
                title: item.eventTitle,
                description: item.description,
                category: item.category,
                date: item.date,
              },
              normalizedQuery
            )
          : 0,
      }))
      .filter(
        (entry) =>
          !normalizedQuery ||
          entry.score > 0
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )
  }, [rows, year, normalizedQuery])

  return (
    <section
      id="gallery"
      className="content-section"
    >
      <p className="section-label">
        MOMENTS THAT MATTER
      </p>

      <h2>
        Our <span>Journey</span>
      </h2>

      <p className="section-description">
        A look back at our workshops,
        activities, and memorable moments.
      </p>

      <DataState
        loading={loading}
        error={error}
        empty={!rows.length}
      >
        <div className="gallery-tools">
          <div className="gallery-search">
            <label htmlFor="gallery-search-input">
              Search Past Workshops
            </label>

            <div className="gallery-search-field">
              <span aria-hidden="true">
                ⌕
              </span>

              <input
                id="gallery-search-input"
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search a workshop by name or topic..."
                autoComplete="off"
              />

              {query && (
                <button
                  type="button"
                  aria-label="Clear workshop search"
                  onClick={() =>
                    setQuery('')
                  }
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <YearFilter
            rows={rows}
            year={year}
            onChange={setYear}
            id="gallery-year"
          />
        </div>

        {normalizedQuery && (
          <p
            className="gallery-results"
            role="status"
          >
            {visible.length === 0
              ? 'No matching past workshops found.'
              : `${visible.length} matching ${
                  visible.length === 1
                    ? 'activity'
                    : 'activities'
                } — closest matches first`}
          </p>
        )}

        {imageError && (
          <p className="image-warning">
            Some photos could not be
            loaded right now.
          </p>
        )}

        {visible.length ? (
          <HorizontalScroller
            key={`${year}-${normalizedQuery}`}
            className="archive-grid gallery-archive-grid"
            label="past workshops"
            count={visible.length}
            pageByView
          >
            {visible.map(
              ({ item }, index) => (
                <article
                  className="archive-card"
                  key={`${
                    item.eventId ||
                    item.eventTitle
                  }-${index}`}
                >
                  <ImageSlider
                    images={imagesInFolder(
                      imageFiles,
                      'gallery',
                      item.folderName
                    )}
                    title={
                      item.eventTitle ||
                      'Event'
                    }
                  />

                  <div className="archive-body">
                    <div className="archive-meta">
                      <span>
                        {item.category ||
                          'Event'}
                      </span>

                      <span>
                        {item.academicYear}
                      </span>
                    </div>

                    <h3>
                      {item.eventTitle ||
                        'Club Activity'}
                    </h3>

                    {item.date && (
                      <p className="archive-date">
                        📅 {item.date}
                      </p>
                    )}

                    {item.description && (
                      <p className="archive-description">
                        {item.description}
                      </p>
                    )}
                  </div>
                </article>
              )
            )}
          </HorizontalScroller>
        ) : (
          <div className="empty-state">
            {normalizedQuery
              ? 'Try another workshop name or keyword.'
              : 'No activities for this year yet.'}
          </div>
        )}
      </DataState>
    </section>
  )
}

// COMPETITION WINNERS
function WinnersList({ winners }) {
  if (!winners.length) {
    return (
      <p className="winners-empty">
        Winning teams will be announced here.
      </p>
    )
  }

  return (
    <div className="winners-list">
      {winners.map(
        (winner, index) => {
          const position =
            Number(winner.position)

          const place =
            position === 1
              ? '1ST PLACE'
              : position === 2
                ? '2ND PLACE'
                : position === 3
                  ? '3RD PLACE'
                  : `${winner.position}TH PLACE`

          const names = String(
            winner.studentNames || ''
          )
            .split(/[,|;\n]+/)
            .map((name) =>
              name.trim()
            )
            .filter(Boolean)

          return (
            <div
              className={`winner-item winner-place-${position}`}
              key={`${
                winner.teamName
              }-${index}`}
            >
              <div className="winner-heading">
                <span className="winner-medal">
                  {position === 1
                    ? '🥇'
                    : position === 2
                      ? '🥈'
                      : position === 3
                        ? '🥉'
                        : '🏅'}
                </span>

                <span className="winner-position">
                  {place}
                </span>
              </div>

              <h4>
                {winner.teamName ||
                  'Winning Team'}
              </h4>

              {names.length > 0 && (
                <p className="winner-students">
                  {names.join(' • ')}
                </p>
              )}
            </div>
          )
        }
      )}
    </div>
  )
}

// HALL OF FAME
function CompetitionsSection({
  imageFiles,
  imageError,
  data,
  winners,
  year,
  onYearChange,
}) {
  const competitions = data

  const visible = competitions.rows
    .map((item, index) => ({
      item,
      index,
    }))
    .filter(
      ({ item }) =>
        year === 'all' ||
        item.academicYear === year
    )

  return (
    <section
      id="hall-of-fame"
      className="content-section"
    >
      <p className="section-label">
        CELEBRATING ACHIEVEMENT
      </p>

      <h2>
        Hall of <span>Fame</span>
      </h2>

      <p className="section-description">
        Celebrating the competitions,
        teamwork, and achievements of
        our students.
      </p>

      <DataState
        loading={
          competitions.loading ||
          winners.loading
        }
        error={
          competitions.error ||
          winners.error
        }
        empty={
          !competitions.rows.length
        }
      >
        <YearFilter
          rows={competitions.rows}
          year={year}
          onChange={onYearChange}
          id="competition-year"
        />

        {imageError && (
          <p className="image-warning">
            Some photos could not be
            loaded right now.
          </p>
        )}

        {visible.length ? (
          <HorizontalScroller
            className="archive-grid"
            label="competitions"
            count={visible.length}
          >
            {visible.map(
              ({
                item: competition,
                index,
              }) => {
                const matchingWinners =
                  winners.rows
                    .filter(
                      (winner) =>
                        String(
                          winner.competitionId ||
                            ''
                        ).trim() ===
                        String(
                          competition.competitionId ||
                            ''
                        ).trim()
                    )
                    .sort(
                      (a, b) =>
                        (Number(
                          a.position
                        ) || 999) -
                        (Number(
                          b.position
                        ) || 999)
                    )

                return (
                  <article
                    className="archive-card competition-card"
                    key={`${
                      competition.competitionId
                    }-${index}`}
                  >
                    <ImageSlider
                      images={imagesInFolder(
                        imageFiles,
                        'competitions',
                        competition.folderName
                      )}
                      title={
                        competition.competitionName ||
                        'Competition'
                      }
                    />

                    <div className="archive-body">
                      <div className="archive-meta">
                        <span>
                          Competition
                        </span>

                        <span>
                          {competition.academicYear}
                        </span>
                      </div>

                      <h3>
                        {competition.competitionName ||
                          'Competition'}
                      </h3>

                      {competition.date && (
                        <p className="archive-date">
                          📅 {competition.date}
                        </p>
                      )}

                      {competition.description && (
                        <p className="archive-description">
                          {competition.description}
                        </p>
                      )}

                      <div className="competition-divider" />

                      <h4 className="winners-title">
                        Winning Teams
                      </h4>

                      <WinnersList
                        winners={matchingWinners}
                      />
                    </div>
                  </article>
                )
              }
            )}
          </HorizontalScroller>
        ) : (
          <div className="empty-state">
            No competitions for this year yet.
          </div>
        )}
      </DataState>
    </section>
  )
}

// TEAM SHOWCASE
function TeamSection() {
  const [selected, setSelected] =
    useState(0)

  const member =
    teamMembers[selected]

  return (
    <section
      id="team"
      className="content-section team-section"
    >
      <p className="section-label">
        THE PEOPLE BEHIND SE CLUB
      </p>

      <h2>
        Meet Our <span>Core Team</span>
      </h2>

      <p className="section-description">
        Meet the people working together
        to make things happen.
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
            <span className="team-featured-eyebrow">
              SE CLUB CORE TEAM
            </span>

            <span className="team-featured-number">
              {String(
                selected + 1
              ).padStart(2, '0')}
              {' / '}
              {String(
                teamMembers.length
              ).padStart(2, '0')}
            </span>

            <span className="team-featured-role">
              {member.role}
            </span>

            <h3>
              {member.name}
            </h3>

            <p
              className="team-featured-arabic"
              lang="ar"
              dir="rtl"
            >
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
                  setSelected(
                    (current) =>
                      (current -
                        1 +
                        teamMembers.length) %
                      teamMembers.length
                  )
                }
                aria-label="Previous team member"
              >
                ←
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelected(
                    (current) =>
                      (current + 1) %
                      teamMembers.length
                  )
                }
                aria-label="Next team member"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <p className="team-selector-title">
          EXPLORE THE TEAM
        </p>

        <div className="team-selector">
          {teamMembers.map(
            (person, index) => (
              <button
                type="button"
                className={`team-selector-item ${
                  selected === index
                    ? 'active'
                    : ''
                }`}
                key={person.name}
                onClick={() =>
                  setSelected(index)
                }
                aria-label={`Show ${person.name}`}
                aria-pressed={
                  selected === index
                }
              >
                <img
                  src={asset(
                    person.image
                  )}
                  alt=""
                  loading="lazy"
                />

                <span>
                  {person.name.split(
                    ' '
                  )[0]}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </section>
  )
}

// INSTALL SE CLUB
function InstallSEClub() {
  const [
    deferredPrompt,
    setDeferredPrompt,
  ] = useState(null)

  const [
    installed,
    setInstalled,
  ] = useState(
    () =>
      window.matchMedia(
        '(display-mode: standalone)'
      ).matches ||
      window.navigator.standalone === true
  )

  const [
    showInstructions,
    setShowInstructions,
  ] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    function handleAppInstalled() {
      setInstalled(true)
      setDeferredPrompt(null)
      setShowInstructions(false)
    }

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    )

    window.addEventListener(
      'appinstalled',
      handleAppInstalled
    )

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )

      window.removeEventListener(
        'appinstalled',
        handleAppInstalled
      )
    }
  }, [])

  async function handleInstall() {
    if (deferredPrompt) {
      const promptEvent =
        deferredPrompt

      setDeferredPrompt(null)

      try {
        await promptEvent.prompt()
        await promptEvent.userChoice
      } catch (error) {
        console.warn(
          'Install prompt unavailable:',
          error
        )

        setShowInstructions(true)
      }

      return
    }

    setShowInstructions(
      (current) => !current
    )
  }

  if (installed) return null

  const isIOS =
    /iPhone|iPad|iPod/i.test(
      navigator.userAgent
    )

  const isAndroid =
    /Android/i.test(
      navigator.userAgent
    )

  return (
    <div className="install-area">
      <button
        className="install-button"
        type="button"
        onClick={handleInstall}
      >
        <span aria-hidden="true">
          ＋
        </span>
        {' '}Add SE Club to Home Screen
      </button>

      {showInstructions && (
        <div
          className="install-guide"
          role="status"
        >
          <button
            type="button"
            className="install-guide-close"
            aria-label="Close install instructions"
            onClick={() =>
              setShowInstructions(false)
            }
          >
            ×
          </button>

          <strong>
            Install SE Club
          </strong>

          {isIOS ? (
            <p>
              On iPhone or iPad:
              open this site in Safari,
              tap the Share button,
              then select
              <b> Add to Home Screen</b>
              {' '}and tap Add.
            </p>
          ) : isAndroid ? (
            <p>
              On Android: open this
              site in Chrome, tap
              the browser menu (⋮),
              then choose
              <b> Install app</b>
              {' '}or
              <b> Add to Home screen</b>.
            </p>
          ) : (
            <p>
              On your computer:
              open this site in
              Chrome or Edge,
              then use the browser
              menu to choose
              <b> Install SE Club</b>,
              <b> Install app</b>
              {' '}or
              <b> Create shortcut</b>.
            </p>
          )}

          <p className="install-guide-note">
            Your shortcut opens the
            official club website.
            An internet connection
            is required for live updates.
          </p>
        </div>
      )}
    </div>
  )
}

// BACK TO TOP
function BackToTop() {
  const [visible, setVisible] =
    useState(false)

  useEffect(() => {
    const update = () =>
      setVisible(
        window.scrollY > 550
      )

    update()

    window.addEventListener(
      'scroll',
      update,
      { passive: true }
    )

    return () =>
      window.removeEventListener(
        'scroll',
        update
      )
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      className="back-to-top"
      aria-label="Back to top"
      title="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    >
      ↑
    </button>
  )
}

// MAIN WEBSITE
function App() {
  const {
    files: imageFiles,
    error: imageError,
  } = useRepositoryImages()

  const events =
    useSheet(EVENTS_URL)

  const forms =
    useSheet(FORMS_URL)

  const gallery =
    useSheet(GALLERY_URL)

  const competitions =
    useSheet(COMPETITIONS_URL)

  const winners =
    useSheet(WINNERS_URL)

  const [
    competitionYear,
    setCompetitionYear,
  ] = useState('all')

  useEffect(() => {
    if (
      !('serviceWorker' in navigator)
    ) {
      return
    }

    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost'
    ) {
      return
    }

    navigator.serviceWorker
      .register(
        `${import.meta.env.BASE_URL}sw.js`,
        {
          scope: import.meta.env.BASE_URL,
        }
      )
      .catch((error) =>
        console.warn(
          'Service worker registration failed:',
          error
        )
      )
  }, [])

  return (
    <div
      className="website"
      id="home"
    >
      <header className="navbar">
        <a
          href="#home"
          aria-label="SE Club Home"
        >
          <img
            src={asset('logo.jpeg')}
            alt="SE Club Logo"
            className="club-logo"
          />
        </a>

        <nav aria-label="Main navigation">
          <a href="#home">
            Home
          </a>

          <a href="#vision">
            Our Vision
          </a>

          <a href="#events">
            Events
          </a>

          <a href="#forms">
            Forms
          </a>

          <a href="#gallery">
            Our Journey
          </a>

          <a href="#hall-of-fame">
            Hall of Fame
          </a>

          <a href="#team">
            Our Team
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <p className="tagline">
            APPLIED SCIENCE
            PRIVATE UNIVERSITY
          </p>

          <h1>
            Software Engineering
            {' '}
            <span>Club.</span>
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

          <InstallSEClub />

          <SocialLinks />

          <div className="hero-scroll">
            SCROLL TO EXPLORE ↓
          </div>
        </section>

        <VisionSection />

        <EventsSection
          data={events}
        />

        <FormsSection
          data={forms}
        />

        <GallerySection
          data={gallery}
          imageFiles={imageFiles}
          imageError={imageError}
        />

        <CompetitionsSection
          data={competitions}
          winners={winners}
          imageFiles={imageFiles}
          imageError={imageError}
          year={competitionYear}
          onYearChange={
            setCompetitionYear
          }
        />

        <TeamSection />
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <img
            src={asset('logo.jpeg')}
            alt="SE Club"
            className="footer-logo"
          />

          <span>
            Software Engineering Club
          </span>
        </div>

        <p>
          Applied Science
          Private University
        </p>

        <p>
          © {new Date().getFullYear()}
          {' '}SE Club.
          All Rights Reserved.
        </p>
      </footer>

      <BackToTop />
    </div>
  )
}

export default App
