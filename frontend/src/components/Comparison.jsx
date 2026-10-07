import React from 'react';
import { Check, X, Shield, Sparkles } from 'lucide-react';

export default function Comparison() {
  const features = [
    { name: 'Visual 3D Card Stacks', linq: true, browser: false, pocket: false },
    { name: 'Automatic 4K Video Previews (YouTube, Hotstar)', linq: true, browser: false, pocket: 'Partial' },
    { name: 'Contextual Spaces (Dev, Design, Personal)', linq: true, browser: false, pocket: 'Folder lists only' },
    { name: 'Sub-12ms Instant Fuzzy Search', linq: true, browser: false, pocket: false },
    { name: 'End-to-End Zero-Knowledge Encryption', linq: true, browser: false, pocket: false },
    { name: '100% Ad-Free & No Affiliate Injection', linq: true, browser: true, pocket: false },
    { name: 'Native iOS 18 Polish & Frosted Dock', linq: true, browser: false, pocket: false },
    { name: 'Offline Cached Snapshots', linq: true, browser: false, pocket: 'Pro Only ($$$)' },
  ];

  return (
    <section className="comparison-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Sparkles size={14} />
            <span>Why Power Users Switch</span>
          </div>
          <h2 className="section-title">
            How LinQ Compares to <span className="text-gradient">The Status Quo</span>
          </h2>
          <p className="section-subtitle">
            See why developers, designers, and researchers are ditching outdated bookmark bars for LinQ.
          </p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Feature / Capability</th>
                <th className="highlight-col" style={{ width: '25%', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <img src="/assets/linq-icon.png" alt="LinQ" style={{ width: '22px', height: '22px', borderRadius: '6px' }} />
                    <span style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>LinQ</span>
                  </div>
                </th>
                <th style={{ width: '18%', textAlign: 'center' }}>Browser Bookmarks</th>
                <th style={{ width: '17%', textAlign: 'center' }}>Pocket / Raindrop</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={i}>
                  <td>{f.name}</td>
                  <td className="highlight-col" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(37,99,235,0.25)', color: '#38bdf8' }}>
                      <Check size={16} strokeWidth={3} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {f.browser === true ? (
                      <Check size={16} color="#94a3b8" />
                    ) : (
                      <X size={16} color="#64748b" />
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {typeof f.pocket === 'string' ? (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{f.pocket}</span>
                    ) : f.pocket ? (
                      <Check size={16} color="#94a3b8" />
                    ) : (
                      <X size={16} color="#64748b" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
