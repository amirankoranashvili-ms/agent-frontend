import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">FAST <span>X</span> FOOD</div>
          <p className="footer-tagline">Smashed to Order.</p>
        </div>

        <div className="footer-col">
          <h4>Menu</h4>
          <Link to="/menu">Full Menu</Link>
          <Link to="/menu?cat=burgers">Burgers</Link>
          <Link to="/menu?cat=breakfast">Breakfast</Link>
          <Link to="/menu?cat=combos">Combo Meals</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/careers">Careers</Link>
        </div>

        <div className="footer-col">
          <h4>Connect</h4>
          <Link to="/drive-through">Drive-Through</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Fast X Food. All rights reserved. This is a demo — not a real restaurant.</p>
      </div>
    </footer>
  )
}
