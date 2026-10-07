import React, { useState } from 'react';
import { Apple, Play, Sparkles, Shield, Layers, Zap, ExternalLink, ArrowRight, Eye } from 'lucide-react';

export default function Hero({ openAuthModal }) {
  const [activeScreen, setActiveScreen] = useState('home'); // 'home' or 'login'

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            <span>LinQ 1.0 : The Visual Bookmarking Standard . releasing soon !</span>
          </div>

          {/* Heading */}
          <h1 className="hero-title">
            Remember Everything. <br />
            <span className="text-gradient">Clutter Nothing.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Say goodbye to forgotten tabs and lifeless browser folders. LinQ turns your web into 
            dynamic visual decks, rich streaming previews, and collaborative spaces with instant recall.
          </p>

          {/* CTA Group */}
          <div className="hero-cta-group">
            <button 
              className="btn btn-primary btn-glow"
              onClick={() => {
                const el = document.getElementById('download');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Apple size={18} />
              <span>Download on App Store</span>
            </button>
          </div>

          {/* Platform Support Indicators */}
          <div className="hero-platforms">
            <span>✓ iOS 26 & 27</span>
          </div>
        </div>

        {/* Device Showcase Area */}
        <div className="showcase-wrapper">
          {/* Mockup Switcher Controls */}
          <div className="mockup-controls">
            <button 
              className={`mockup-tab-btn ${activeScreen === 'home' ? 'active' : ''}`}
              onClick={() => setActiveScreen('home')}
            >
              <Layers size={16} />
              <span>App Home</span>
            </button>
            <button 
              className={`mockup-tab-btn ${activeScreen === 'login' ? 'active' : ''}`}
              onClick={() => setActiveScreen('login')}
            >
              <Shield size={16} />
              <span>Auth Screen</span>
            </button>
          </div>

          {/* Showcase Stage with Device & Floating Badges */}
          <div className="showcase-stage">
            {/* Floating Badge 1 - Top Left */}
            <div className="floating-badge badge-top-left">
              <div className="floating-badge-icon">
                <Play size={20} fill="#3b82f6" />
              </div>
              <div>
                <div className="floating-badge-title">Rich Media Previews</div>
                <div className="floating-badge-desc">YouTube 4K & Hotstar extracted</div>
              </div>
            </div>

            {/* Floating Badge 2 - Mid Right */}
            <div className="floating-badge badge-mid-right">
              <div className="floating-badge-icon">
                <Layers size={20} />
              </div>
              <div>
                <div className="floating-badge-title">Visual Card Stacks</div>
                <div className="floating-badge-desc">Layered decks with item counts</div>
              </div>
            </div>

            {/* Floating Badge 3 - Bottom Right */}
            <div className="floating-badge badge-bottom-right">
              <div className="floating-badge-icon">
                <Zap size={20} />
              </div>
              <div>
                <div className="floating-badge-title">Instant Recall &lt;10ms</div>
                <div className="floating-badge-desc">Fuzzy search across all Spaces</div>
              </div>
            </div>

            {/* Phone Device Mockup Container */}
            <div className="phone-frame">
              <div className="phone-screen">
                <img 
                  src={activeScreen === 'home' ? '/assets/app-home.png' : '/assets/app-login.png'} 
                  alt={activeScreen === 'home' ? 'LinQ Home Screen' : 'LinQ Login Screen'} 
                  className="phone-img"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
