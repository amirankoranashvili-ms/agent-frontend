import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Menu.css'

const API_BASE = 'https://fastxfood-api-764628510125.us-central1.run.app'
const THUMB_BASE = 'https://storage.googleapis.com/fastxfood-assets/banners-medium'
const BANNER_BASE = 'https://storage.googleapis.com/fastxfood-assets/banners-full'

function formatPrice(cents) {
  if (!cents) return null
  return `$${(cents / 100).toFixed(2)}`
}

function priceDisplay(item) {
  if (item.sizes && item.sizes.length > 0) {
    return `${formatPrice(item.sizes[0].price)}–${formatPrice(item.sizes[item.sizes.length - 1].price)}`
  }
  return formatPrice(item.basePrice)
}

const TAG_STYLES = {
  popular: { bg: 'var(--color-accent)', color: 'var(--color-secondary)' },
  bestseller: { bg: 'var(--color-primary)', color: '#fff' },
  'limited-time': { bg: 'var(--color-warning)', color: '#fff' },
  seasonal: { bg: 'var(--color-warning)', color: '#fff' },
  spicy: { bg: 'var(--color-warning)', color: '#fff' },
  'high-protein': { bg: 'var(--color-secondary)', color: 'var(--color-text-on-dark)' },
  vegetarian: { bg: 'var(--color-success)', color: '#fff' },
  vegan: { bg: 'var(--color-success)', color: '#fff' },
  'kids-friendly': { bg: 'var(--color-accent)', color: 'var(--color-secondary)' },
  'under-500-cal': { bg: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid #ccc' },
}

const CAT_BANNERS = {
  'cat-burgers': 'banner-burgers', 'cat-chicken': 'banner-chicken',
  'cat-sides': 'banner-sides', 'cat-drinks': 'banner-drinks',
  'cat-desserts': 'banner-desserts', 'cat-sauces': 'banner-sauces',
  'cat-combos': 'banner-combos', 'cat-breakfast': 'banner-breakfast',
  'cat-kids': 'banner-kids',
}

export default function Menu() {
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState(null)
  const [catDrawerOpen, setCatDrawerOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const sectionRefs = useRef({})
  const isScrolling = useRef(false)

  useEffect(() => {
    fetch(`${API_BASE}/v1/menu`)
      .then(r => r.json())
      .then(data => {
        setMenu(data)
        if (data.categories?.length) setActiveCat(data.categories[0].id)
        setLoading(false)
        const catParam = searchParams.get('cat')
        if (catParam) {
          const matchId = `cat-${catParam}`
          const match = data.categories.find(c => c.id === matchId || c.name.toLowerCase() === catParam.toLowerCase())
          if (match) {
            setTimeout(() => scrollToCategory(match.id), 150)
          }
        }
      })
      .catch(() => setLoading(false))
  }, [])

  const handleScroll = useCallback(() => {
    if (isScrolling.current || !menu) return
    const offset = 120
    let current = null
    for (const cat of menu.categories) {
      const el = sectionRefs.current[cat.id]
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= offset) current = cat.id
      }
    }
    if (current && current !== activeCat) setActiveCat(current)
  }, [menu, activeCat])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  function scrollToCategory(catId) {
    isScrolling.current = true
    setActiveCat(catId)
    const el = sectionRefs.current[catId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setTimeout(() => { isScrolling.current = false }, 800)
  }

  if (loading) return <div className="menu-loading">Loading menu...</div>
  if (!menu) return <div className="menu-loading">Could not load menu.</div>

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1 className="menu-title">OUR MENU</h1>
        <p className="menu-subtitle">Smashed, fried, grilled — made your way.</p>
      </div>

      <div className="menu-layout">
        <nav className="menu-sidebar">
          {menu.categories.map(cat => {
            const bannerFile = CAT_BANNERS[cat.id]
            return (
              <button
                key={cat.id}
                className={`menu-sidebar-btn ${cat.id === activeCat ? 'active' : ''}`}
                onClick={() => scrollToCategory(cat.id)}
              >
                {bannerFile && (
                  <img
                    className="menu-sidebar-img"
                    src={`${THUMB_BASE}/${bannerFile}.webp`}
                    alt={cat.name}
                  />
                )}
                <div className="menu-sidebar-text">
                  <span className="menu-sidebar-name">{cat.name}</span>
                  <span className="menu-sidebar-count">{cat.items.length} items</span>
                </div>
              </button>
            )
          })}
        </nav>

        <button className="menu-cat-toggle" onClick={() => setCatDrawerOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>{menu.categories.find(c => c.id === activeCat)?.name || 'Categories'}</span>
        </button>

        {catDrawerOpen && <div className="menu-cat-overlay" onClick={() => setCatDrawerOpen(false)} />}
        <div className={`menu-cat-drawer ${catDrawerOpen ? 'open' : ''}`}>
          <div className="menu-cat-drawer-header">
            <span>Categories</span>
            <button onClick={() => setCatDrawerOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {menu.categories.map(cat => {
            const bannerFile = CAT_BANNERS[cat.id]
            return (
              <button
                key={cat.id}
                className={`menu-cat-drawer-btn ${cat.id === activeCat ? 'active' : ''}`}
                onClick={() => { scrollToCategory(cat.id); setCatDrawerOpen(false) }}
              >
                {bannerFile && (
                  <img src={`${THUMB_BASE}/${bannerFile}.webp`} alt={cat.name} className="menu-cat-drawer-img" />
                )}
                <div className="menu-cat-drawer-text">
                  <span className="menu-cat-drawer-name">{cat.name}</span>
                  <span className="menu-cat-drawer-count">{cat.items.length} items</span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="menu-content">
          {menu.categories.map(cat => (
            <section
              key={cat.id}
              className="menu-category"
              ref={el => sectionRefs.current[cat.id] = el}
            >
              {CAT_BANNERS[cat.id] && (
                <div className="menu-cat-banner">
                  <img src={`${BANNER_BASE}/${CAT_BANNERS[cat.id]}.webp`} alt={cat.name} />
                  <span className="menu-cat-banner-name">{cat.name}</span>
                </div>
              )}

              <div className="menu-items">
                {cat.items.map(item => (
                  <div className="menu-item-card" key={item.id}>
                    {item.image && (
                      <img className="menu-item-img" src={item.image} alt={item.name} loading="lazy" />
                    )}
                    <div className="menu-item-info">
                      <div className="menu-item-top">
                        <h3 className="menu-item-name">{item.name}</h3>
                        <span className="menu-item-price">{priceDisplay(item)}</span>
                      </div>
                      <p className="menu-item-desc">{item.description}</p>
                      <div className="menu-item-tags">
                        {(item.tags || []).map(tag => {
                          const s = TAG_STYLES[tag] || {}
                          return (
                            <span key={tag} className="menu-item-tag" style={{ background: s.bg, color: s.color, border: s.border || 'none' }}>
                              {tag.replace(/-/g, ' ')}
                            </span>
                          )
                        })}
                      </div>
                      {item.sizes && item.sizes.length > 0 && (
                        <div className="menu-item-sizes">
                          {item.sizes.map(s => (
                            <span key={s.name} className="menu-size">{s.name} {formatPrice(s.price)}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
