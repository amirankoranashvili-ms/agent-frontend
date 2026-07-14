import './About.css'

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1 className="about-title">ABOUT FAST X FOOD</h1>
        <p className="about-tagline">Smashed to Order Since 2024.</p>
      </div>

      <section className="about-section">
        <div className="about-content">
          <div className="about-text">
            <h2>The Story</h2>
            <p>
              Fast X Food started with a simple idea: fast food doesn't have to be
              forgettable. We opened our first location in 2024 with one flat-top grill,
              a tight menu, and a rule — every burger gets smashed to order. No heat lamps.
              No pre-made patties. No apologies.
            </p>
            <p>
              Two years later, we're in multiple cities and still doing it the same way.
              Fresh beef, toasted buns, real ingredients. The menu has grown — chicken
              sandwiches, breakfast, tenders, shakes — but the standard hasn't changed.
              If it's not fresh, it doesn't leave the window.
            </p>
          </div>
          <div className="about-image">
            <img
              src="https://storage.googleapis.com/fastxfood-assets/banners-full/banner-burgers.webp"
              alt="Our burgers"
            />
          </div>
        </div>
      </section>

      <section className="about-values">
        <h2 className="section-title-center">WHAT WE STAND FOR</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-number">01</div>
            <h3>Smashed Fresh</h3>
            <p>
              Every patty is smashed on a hot flat-top when you order it. That's how you
              get the crispy edges and the juicy center. We don't batch-cook. We don't
              microwave. If you're waiting an extra minute, that's your burger on the grill.
            </p>
          </div>
          <div className="value-card">
            <div className="value-number">02</div>
            <h3>Real Ingredients</h3>
            <p>
              100% beef. Hand-breaded chicken. Buns baked daily. Sauces made in-house.
              We list every allergen and every ingredient because we've got nothing to hide.
              You should know what you're eating.
            </p>
          </div>
          <div className="value-card">
            <div className="value-number">03</div>
            <h3>Fast, Not Rushed</h3>
            <p>
              We move quick because we're good at what we do, not because we cut corners.
              Average drive-through time is under 4 minutes. We take that seriously — your
              lunch break isn't getting any longer.
            </p>
          </div>
          <div className="value-card">
            <div className="value-number">04</div>
            <h3>No Nonsense</h3>
            <p>
              Simple menu. Clear prices. No surprise fees. No upselling you don't want.
              If you say "that's it," we move to checkout. We respect your time and your order.
            </p>
          </div>
        </div>
      </section>

      <section className="about-numbers">
        <div className="numbers-grid">
          <div className="number-block">
            <span className="number-value">12</span>
            <span className="number-label">Locations</span>
          </div>
          <div className="number-block">
            <span className="number-value">36</span>
            <span className="number-label">Menu Items</span>
          </div>
          <div className="number-block">
            <span className="number-value">3.8M</span>
            <span className="number-label">Burgers Served</span>
          </div>
          <div className="number-block">
            <span className="number-value">3:47</span>
            <span className="number-label">Avg Drive-Thru Time</span>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content reverse">
          <div className="about-text">
            <h2>AI-Powered Drive-Through</h2>
            <p>
              We're piloting an AI voice agent at the drive-through window. It takes your
              order conversationally — no button pressing, no screen tapping. Just say what
              you want, customize however you like, and it handles the rest.
            </p>
            <p>
              The system knows our full menu, handles combos and modifications, checks
              allergens, applies promo codes, and connects to our loyalty program. If anything
              gets complicated, it routes you to a human instantly. It's fast food ordering
              that actually feels natural.
            </p>
          </div>
          <div className="about-image">
            <img
              src="https://storage.googleapis.com/fastxfood-assets/banners-full/banner-chicken.webp"
              alt="Our kitchen"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
