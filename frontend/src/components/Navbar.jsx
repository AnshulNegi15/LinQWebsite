import React, { useState } from 'react';
import { Menu, X, Sparkles, Download, ArrowRight, User } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, openAuthModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view, sectionId = null) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    if (view === 'home' && sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="container">
        <nav className="navbar">
          {/* Brand Logo */}
          <div className="logo-container" onClick={() => handleNavClick('home')}>
            <img
              src="/assets/linq-icon.png"
              alt="LinQ Icon"
              className="logo-icon-img"
            />
            <span className="logo-text">
              Lin<span className="blue-q">Q</span>
            </span>
          </div>

          {/* Desktop Nav Items */}
          <ul className="nav-links">
            <li>
              <button
                className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('home', 'features')}
              >
                Features
              </button>
            </li>
            <li>
              <button
                className="nav-link"
                onClick={() => handleNavClick('home', 'pricing')}
              >
                Pricing
              </button>
            </li>
            <li>
              <button
                className="nav-link"
                onClick={() => handleNavClick('home', 'faq')}
              >
                FAQ
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${currentView === 'terms' ? 'active' : ''}`}
                onClick={() => handleNavClick('terms')}
              >
                Terms of Use
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${currentView === 'privacy' ? 'active' : ''}`}
                onClick={() => handleNavClick('privacy')}
              >
                Privacy Policy
              </button>
            </li>
          </ul>

          {/* Desktop Actions */}
          <div className="nav-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => openAuthModal('login')}
            >
              <User size={15} />
              <span>Log In</span>
            </button>
            <button
              className="btn btn-primary btn-sm btn-glow"
              onClick={() => {
                if (currentView !== 'home') setCurrentView('home');
                setTimeout(() => {
                  const el = document.getElementById('download');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
            >
              <Download size={15} />
              <span>Get LinQ</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <button className="nav-link" onClick={() => handleNavClick('home', 'features')}>
            Features
          </button>
          <button className="nav-link" onClick={() => handleNavClick('home', 'collections')}>
            Collections & Stacks
          </button>
          <button className="nav-link" onClick={() => handleNavClick('home', 'playground')}>
            Live Playground
          </button>
          <button className="nav-link" onClick={() => handleNavClick('home', 'pricing')}>
            Pricing
          </button>
          <button className="nav-link" onClick={() => handleNavClick('home', 'faq')}>
            FAQ
          </button>
          <button className="nav-link" onClick={() => handleNavClick('terms')}>
            Terms of Use
          </button>
          <button className="nav-link" onClick={() => handleNavClick('privacy')}>
            Privacy Policy
          </button>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('login');
              }}
            >
              Log In
            </button>
            <button
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('signup');
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
