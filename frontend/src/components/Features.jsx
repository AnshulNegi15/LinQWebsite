import React from 'react';
import { 
  Tv, Film, Users, Zap, ShieldCheck, Share2, 
  Search, Bookmark, Smartphone, Sparkles, RefreshCw, Layers 
} from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Sparkles size={14} />
            <span>Engineered for Power Users</span>
          </div>
          <h2 className="section-title">
            Every Link Rendered In <span className="text-gradient">Vibrant High Definition</span>
          </h2>
          <p className="section-subtitle">
            Most bookmark managers treat links as plain text strings. LinQ processes every URL into a rich, 
            interactive artifact with high-res media, favicon recognition, and space organization.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Card 1: Rich Media Previews (Span 8) */}
          <div className="bento-card col-span-8">
            <div className="bento-icon-pill">
              <Tv size={24} />
            </div>
            <h3 className="bento-title">Automatic Rich Streaming & Media Extraction</h3>
            <p className="bento-desc">
              Save a YouTube video, Hotstar stream, Vimeo clip, or podcast episode. LinQ automatically parses 
              the high-res thumbnail, title metadata, video duration, and creator profile, so your bookmarks 
              look like a personalized streaming library.
            </p>
            <div className="bento-visual-preview">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(18,24,38,0.9)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '56px', height: '40px', borderRadius: '6px', background: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                  ▶ 4K
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>LinQ Stream Engine v2.1</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Auto-extracts HD thumbnails, OpenGraph data & favicons in real-time</div>
                </div>
                <span className="app-pill-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }}>
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Shared Spaces (Span 4) */}
          <div className="bento-card col-span-4">
            <div className="bento-icon-pill">
              <Users size={24} />
            </div>
            <h3 className="bento-title">Spaces for Context</h3>
            <p className="bento-desc">
              Keep work research isolated from personal reading, side projects, and design inspiration. 
              Switch spaces in a tap without tab pollution.
            </p>
            <div className="bento-visual-preview">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(37,99,235,0.2)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 600 }}>💼 Work & Clients</span>
                  <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>42 links</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>🎨 Design System</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>18 links</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Instant Recall & Fuzzy Search (Span 4) */}
          <div className="bento-card col-span-4">
            <div className="bento-icon-pill">
              <Zap size={24} />
            </div>
            <h3 className="bento-title">Sub-12ms Instant Recall</h3>
            <p className="bento-desc">
              Search by domain, custom tags, extracted page titles, or content snippet. 
              Find any bookmark instantly even when offline.
            </p>
            <div className="bento-visual-preview" style={{ textAlign: 'center', padding: '12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: '#38bdf8' }}>
                Query: "vite" ➔ Result in 4.2ms
              </span>
            </div>
          </div>

          {/* Card 4: End-to-End Encryption & Zero Ads (Span 4) */}
          <div className="bento-card col-span-4">
            <div className="bento-icon-pill">
              <ShieldCheck size={24} />
            </div>
            <h3 className="bento-title">Zero Ads. Zero Tracking.</h3>
            <p className="bento-desc">
              Your bookmarks reflect your mind. LinQ never sells data, injects affiliate links, or monetizes 
              your reading history. Your library is encrypted at rest and in transit.
            </p>
            <div className="bento-visual-preview" style={{ textAlign: 'center', padding: '12px' }}>
              <span style={{ fontSize: '0.84rem', color: '#34d399', fontWeight: 600 }}>
                🔒 AES-256 Cloud Encryption
              </span>
            </div>
          </div>

          {/* Card 5: Native Ecosystem Polish (Span 4) */}
          <div className="bento-card col-span-4">
            <div className="bento-icon-pill">
              <Smartphone size={24} />
            </div>
            <h3 className="bento-title">Native iOS & Web Polish</h3>
            <p className="bento-desc">
              Engineered with smooth 120Hz haptics, iOS Share Sheet integration, Safari & Chrome 
              extensions, and fluid gestural navigation.
            </p>
            <div className="bento-visual-preview" style={{ textAlign: 'center', padding: '12px' }}>
              <span style={{ fontSize: '0.84rem', color: '#60a5fa', fontWeight: 600 }}>
                ⚡️ 1-Tap Share Sheet Action
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
