import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Printer, FileText } from 'lucide-react';

export default function PrivacyPolicy({ onBack }) {
  const tableOfContents = [
    { id: 'philosophy', title: '1. Our Privacy Philosophy' },
    { id: 'collection', title: '2. Information We Collect' },
    { id: 'usage', title: '3. How We Use Data' },
    { id: 'preview-engine', title: '4. URL Scraping & Rich Previews' },
    { id: 'encryption', title: '5. Encryption & Security' },
    { id: 'third-parties', title: '6. Third-Party Sub-processors' },
    { id: 'cookies', title: '7. Cookies & Local Storage' },
    { id: 'rights', title: '8. GDPR & CCPA Rights' },
    { id: 'retention', title: '9. Data Retention & Deletion' },
    { id: 'children', title: '10. Children\'s Privacy' },
    { id: 'updates', title: '11. Policy Updates' },
    { id: 'contact-dpo', title: '12. Contact Data Officer' },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="legal-page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="legal-header">
          <button className="legal-back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to LinQ Overview</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className="app-pill-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }}>
              Privacy First Certified
            </span>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>GDPR & CCPA Compliant</span>
          </div>

          <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>
            Privacy <span className="text-gradient">Policy</span>
          </h1>

          <div className="legal-meta-row">
            <span>Last Updated: October 7, 2026</span>
            <span>•</span>
            <span>Effective Date: October 7, 2026</span>
            <span>•</span>
            <span>Zero Data Brokerage Guarantee</span>
          </div>
        </div>

        {/* Layout */}
        <div className="legal-layout">
          {/* Sidebar Table of Contents */}
          <aside className="legal-sidebar">
            <div className="sidebar-title">Table of Contents</div>
            <ul className="sidebar-nav-list">
              {tableOfContents.map((item) => (
                <li key={item.id} className="sidebar-nav-item">
                  <a 
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%', gap: '8px' }}
                onClick={() => window.print()}
              >
                <Printer size={14} />
                <span>Print Policy</span>
              </button>
            </div>
          </aside>

          {/* Legal Content Body */}
          <div className="legal-content-body">
            <div className="legal-highlight-box" style={{ borderColor: '#10b981', background: 'rgba(16,185,129,0.08)' }}>
              <strong>Our Privacy Pledge:</strong> LinQ was founded on the fundamental principle that your bookmark 
              history reflects your personal thoughts, research, and interests. We never sell your personal data, 
              we do not monetize your reading habits through advertisements or affiliate link injections, and your 
              library is encrypted.
            </div>

            <section id="philosophy">
              <h2>1. Our Privacy Philosophy</h2>
              <p>
                At LinQ Technologies Inc. ("LinQ", "we", "us", "our"), privacy is not an afterthought; it is 
                our product foundation. Unlike free bookmarking services that monetize users by injecting affiliate 
                redirects or analyzing personal interests to serve targeted ads, LinQ is financed transparently 
                through premium software subscriptions.
              </p>
            </section>

            <section id="collection">
              <h2>2. Information We Collect</h2>
              <p>We collect only the minimum data necessary to deliver and sync your visual bookmark library:</p>
              <ul>
                <li>
                  <strong>Account Information:</strong> When you register an account, we collect your email address, 
                  authentication provider IDs (e.g. Sign in with Apple or Google SSO), and hashed credentials.
                </li>
                <li>
                  <strong>Bookmark Data:</strong> URLs you explicitly save, page titles, user-defined tags, notes, 
                  custom thumbnails, and organizational Spaces you create.
                </li>
                <li>
                  <strong>Technical Telemetry:</strong> Anonymized diagnostic crash reports and device operating 
                  system version (e.g. iOS 18, macOS Sequoia) to ensure app stability and fix synchronization bugs.
                </li>
              </ul>
              <p>
                <strong>What We Never Collect:</strong> We never track your general browsing history, we do not monitor 
                tabs you do not bookmark, and we never inject cookies into third-party sites you browse.
              </p>
            </section>

            <section id="usage">
              <h2>3. How We Use Data</h2>
              <p>We use your information exclusively for the following operational purposes:</p>
              <ul>
                <li>To synchronize your bookmarks, collections, and Spaces in real-time across your authorized devices.</li>
                <li>To fetch public OpenGraph metadata (titles, descriptions, thumbnails, and favicons) for URLs you clip.</li>
                <li>To authenticate your identity when accessing the LinQ mobile app or web platform.</li>
                <li>To provide customer support and notify you of critical security or subscription updates.</li>
              </ul>
            </section>

            <section id="preview-engine">
              <h2>4. URL Scraping & Rich Previews</h2>
              <p>
                When you save a link (such as a YouTube video, news article, or Figma file), LinQ servers send a 
                standard HTTP request to the target web page to read public OpenGraph metadata, title tags, and 
                thumbnail image URLs.
              </p>
              <p>
                This request is executed by our proxy servers on behalf of the service, preserving your device's 
                IP address from being exposed to the target website during background preview generation.
              </p>
            </section>

            <section id="encryption">
              <h2>5. Encryption & Security</h2>
              <p>We implement rigorous defense-in-depth security standards:</p>
              <ul>
                <li><strong>In Transit:</strong> All communications between your devices and LinQ servers are encrypted using TLS 1.3 with modern cipher suites.</li>
                <li><strong>At Rest:</strong> All stored database clusters and file storage are encrypted with AES-256 military-grade encryption.</li>
                <li><strong>Biometric Security:</strong> On iOS and macOS, LinQ supports Face ID and Touch ID to protect local app access.</li>
              </ul>
            </section>

            <section id="third-parties">
              <h2>6. Third-Party Sub-processors</h2>
              <p>
                We partner only with vetted cloud infrastructure providers that maintain industry-leading 
                SOC 2 Type II and ISO 27001 certifications:
              </p>
              <ul>
                <li><strong>Cloud Infrastructure:</strong> AWS (Amazon Web Services) & Cloudflare for encrypted hosting and global CDN edge routing.</li>
                <li><strong>Payment Processing:</strong> Stripe for web subscriptions and Apple App Store for iOS in-app purchases. LinQ never receives or stores your credit card numbers.</li>
                <li><strong>Transactional Email:</strong> Resend / AWS SES for password resets and verification tokens.</li>
              </ul>
            </section>

            <section id="cookies">
              <h2>7. Cookies & Local Storage</h2>
              <p>
                LinQ does not use advertising, marketing, or retargeting cookies. We use only strictly necessary 
                session tokens stored in HTTP-only secure cookies and browser LocalStorage to maintain your login 
                session and cache your bookmarks for instant offline access.
              </p>
            </section>

            <section id="rights">
              <h2>8. GDPR & CCPA Rights</h2>
              <p>Regardless of your geographic location, LinQ provides global privacy rights:</p>
              <ul>
                <li><strong>Right to Access:</strong> You may request a complete export of all personal data we hold about you.</li>
                <li><strong>Right to Portability:</strong> You can export your entire bookmark library at any time in standard JSON, Markdown, or HTML formats.</li>
                <li><strong>Right to Erasure (Right to be Forgotten):</strong> You may permanently delete your account and all associated data with one click in Settings.</li>
                <li><strong>Right to Rectification:</strong> You can modify or update your personal account details anytime.</li>
              </ul>
            </section>

            <section id="retention">
              <h2>9. Data Retention & Deletion</h2>
              <p>
                We retain your bookmark data only for as long as your account is active. When you delete your 
                account, all stored URLs, metadata, thumbnails, notes, and collections are permanently purged from 
                our primary databases immediately, and wiped from encrypted backup snapshots within 30 days.
              </p>
            </section>

            <section id="children">
              <h2>10. Children's Privacy</h2>
              <p>
                LinQ is not directed to individuals under the age of 13 (or under 16 in the European Union). We do not 
                knowingly collect personal information from children. If we become aware of an unauthorized account 
                created by a minor, we will promptly delete it.
              </p>
            </section>

            <section id="updates">
              <h2>11. Policy Updates</h2>
              <p>
                We may periodically update this Privacy Policy to reflect enhancements in our architecture or evolving 
                legal requirements. If we make material modifications, we will notify you through the app interface 
                or via email prior to the changes taking effect.
              </p>
            </section>

            <section id="contact-dpo">
              <h2>12. Contact Data Protection Officer (DPO)</h2>
              <p>
                If you have questions, inquiries, or privacy requests regarding your data, please contact our Data Protection Officer:
              </p>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div><strong>LinQ Data Protection & Privacy Office</strong></div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                  Email: privacy@linqapp.io • Attention: Data Protection Officer
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
