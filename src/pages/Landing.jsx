import { Link } from 'react-router-dom'
import './Landing.css'

const NEWS_ITEMS = [
  {
    tag: 'New Location',
    title: 'Fast X Food Opens on South Congress, Austin',
    image: 'https://storage.googleapis.com/fastxfood-assets/banners-full/banner-combos.webp',
    text: 'We\'re officially in Austin. Our newest location just opened its doors on South Congress Avenue — right in the heart of the action. The full menu is live from day one: smash burgers, chicken sandwiches, breakfast, kids meals, the works. Grand opening weekend runs July 19-20 with free Classic Fries on every order. If you\'re in town, come through. Same burgers, new city.',
    date: 'July 14, 2026',
  },
  {
    tag: 'Limited Time',
    title: 'The Summer BBQ Burger Has Arrived',
    image: 'https://storage.googleapis.com/fastxfood-assets/items-full/summer-bbq-burger.webp',
    text: 'This one\'s been in the lab for months. Double smashed beef patty, a caramelized pineapple ring, house teriyaki glaze, crispy fried onion strings, and fresh lettuce — all stacked on a toasted sesame bun. It\'s sweet, savory, crunchy, and gone after September 1st. We brought it back because you asked, and we\'re not sorry about any of it. Available at all locations while supplies last.',
    date: 'July 1, 2026',
  },
  {
    tag: 'New',
    title: 'Breakfast Is Now Served Daily, 6am–10:30am',
    image: 'https://storage.googleapis.com/fastxfood-assets/banners-full/banner-breakfast.webp',
    text: 'We heard you — mornings needed more from us. Starting June 15th, every Fast X Food location serves breakfast from 6am to 10:30am. The lineup: our Breakfast Sandwich with scrambled eggs, sausage, and melted cheese on a toasted bun. The Breakfast Burrito loaded with eggs, sausage, cheese, and onions in a warm tortilla. Crispy Hash Browns. And fresh-brewed coffee in three sizes. Add bacon to anything for $1.50. Early bird, meet smash burger DNA.',
    date: 'June 15, 2026',
  },
  {
    tag: 'Coming Soon',
    title: 'The Fast X Food App — Order Ahead, Skip the Line',
    image: 'https://storage.googleapis.com/fastxfood-assets/banners-full/banner-drinks.webp',
    text: 'This fall, we\'re launching the Fast X Food app for iOS and Android. Order ahead from your phone, customize every ingredient, pay in the app, and pick up at the window with zero wait. Loyalty members get double points on every app order for the first month. Push notifications for new items and promos. Reorder your usual in two taps. We\'re building it right now — sign up for early access through our loyalty program.',
    date: 'Coming Fall 2026',
  },
]

const TAG_COLORS = {
  'New Location': 'var(--color-accent)',
  'Limited Time': 'var(--color-warning)',
  'New': 'var(--color-primary)',
  'Coming Soon': 'var(--color-secondary)',
}

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">REAL BURGERS.<br />REAL FAST.<br />NO NONSENSE.</h1>
          <p className="hero-subtitle">Smashed to order, every single time.</p>
          <div className="hero-actions">
            <Link to="/menu" className="btn-primary">See What's Cooking</Link>
            <Link to="/drive-through" className="btn-secondary-light">Try the Drive-Through</Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://storage.googleapis.com/fastxfood-assets/banners-full/banner-burgers.webp"
            alt="Fast X Food burgers"
          />
        </div>
      </section>

      <section className="promo-banner">
        <div className="promo-inner">
          <div className="promo-badge">LIMITED TIME</div>
          <div className="promo-text">
            <span className="promo-title">Summer BBQ Burger</span>
            <span className="promo-desc">Double patty, pineapple ring, teriyaki glaze — no apologies.</span>
          </div>
          <Link to="/menu" className="promo-cta">Order Now</Link>
        </div>
      </section>

      <section className="categories-strip">
        <div className="categories-inner">
          <h2 className="section-title">What Are You Craving?</h2>
          <div className="categories-grid">
            {[
              { name: 'Burgers', img: 'banner-burgers', cat: 'burgers' },
              { name: 'Chicken', img: 'banner-chicken', cat: 'chicken' },
              { name: 'Breakfast', img: 'banner-breakfast', cat: 'breakfast' },
              { name: 'Sides', img: 'banner-sides', cat: 'sides' },
              { name: 'Drinks', img: 'banner-drinks', cat: 'drinks' },
              { name: 'Desserts', img: 'banner-desserts', cat: 'desserts' },
            ].map(cat => (
              <Link to={`/menu?cat=${cat.cat}`} key={cat.name} className="cat-card">
                <img
                  src={`https://storage.googleapis.com/fastxfood-assets/banners-full/${cat.img}.webp`}
                  alt={cat.name}
                />
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="news-section">
        <div className="news-inner">
          <h2 className="section-title">What's New</h2>
          <div className="news-list">
            {NEWS_ITEMS.map((item, i) => (
              <article className="news-card" key={i}>
                <div className="news-card-image">
                  <img src={item.image} alt={item.title} />
                  <div
                    className="news-tag"
                    style={{ background: TAG_COLORS[item.tag] || 'var(--color-secondary)', color: item.tag === 'New Location' || item.tag === 'Coming Soon' ? 'var(--color-text-on-dark)' : '#fff' }}
                  >
                    {item.tag}
                  </div>
                </div>
                <div className="news-card-body">
                  <span className="news-date">{item.date}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
