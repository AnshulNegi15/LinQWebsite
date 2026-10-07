import React from 'react';
import { Apple, Play, Sparkles, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CTA({ openAuthModal }) {
  return (
    <section id="download" className="cta-section">
      <div className="container">
        <div className="cta-box">
          <div className="section-tag" style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
            <Sparkles size={14} />
            <span>Ready in 30 Seconds</span>
          </div>

          <h2 className="cta-title">
            Organize Your Mind. <br />
            <span className="text-gradient">Start Using LinQ Today.</span>
          </h2>

          <p className="cta-desc">
            Transform chaos into visual clarity. Download LinQ for your iPhone, Mac, and browser, 
            or launch directly in the cloud.
          </p>

          <div className="cta-buttons-row">
            <button 
              className="btn btn-primary btn-glow"
              onClick={() => openAuthModal('signup')}
            >
              <Apple size={20} />
              <span>Download for iOS & Mac</span>
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => openAuthModal('signup')}
            >
              <Sparkles size={18} color="#38bdf8" />
              <span>Launch Web Cloud App</span>
            </button>
          </div>

          <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', fontSize: '0.86rem', color: '#94a3b8' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#34d399" /> Free Forever Plan Available
            </span>
            <span>•</span>
            <span>No Credit Card Required</span>
            <span>•</span>
            <span>Takes 10 Seconds to Setup</span>
          </div>
        </div>
      </div>
    </section>
  );
}
