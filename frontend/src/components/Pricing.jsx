import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';

export default function Pricing({ openAuthModal }) {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      name: 'Starter',
      desc: 'Perfect for individual readers and casual bookmarking.',
      price: '$0',
      period: 'forever free',
      featured: false,
      features: [
        'Up to 250 saved bookmarks',
        '3 Contextual Spaces (e.g. Work, Personal)',
        'Automatic HD rich previews & favicons',
        'iOS mobile app & Chrome / Safari sync',
        'Standard fuzzy search',
        'Community support',
      ],
      buttonText: 'Get Started Free',
      action: () => openAuthModal('signup'),
    },
    {
      name: 'LinQ Pro',
      desc: 'For power researchers, engineers, and visual curators.',
      price: annualBilling ? '$3.99' : '$4.99',
      period: annualBilling ? '/ month (billed annually)' : '/ month',
      featured: true,
      features: [
        'Unlimited bookmarks & collections',
        'Unlimited custom Spaces',
        'Sub-12ms offline search & cached snapshots',
        'Broken link & 404 dead page alerts',
        'Full markdown, JSON & CSV automated export',
        'Custom tagging and color rules',
        'Priority encrypted cloud sync',
      ],
      buttonText: 'Start 14-Day Free Trial',
      action: () => openAuthModal('signup'),
    },
    {
      name: 'LinQ Team',
      desc: 'Collaborative workspaces for agencies and squads.',
      price: annualBilling ? '$9.99' : '$12.00',
      period: annualBilling ? '/ member / month' : '/ member / month',
      featured: false,
      features: [
        'Everything in LinQ Pro',
        'Shared collaborative team Spaces',
        'Granular role-based access permissions',
        'Real-time multiplayer bookmark additions',
        'Custom branded public space links',
        'Activity feed & link audit history',
        'Dedicated VIP Slack/Discord support',
      ],
      buttonText: 'Create Team Space',
      action: () => openAuthModal('signup'),
    },
  ];

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Zap size={14} />
            <span>Simple Transparent Pricing</span>
          </div>
          <h2 className="section-title">
            Invest in Your <span className="text-gradient">Digital Memory</span>
          </h2>
          <p className="section-subtitle">
            Start free without a credit card. Upgrade whenever you need unlimited spaces, 
            offline archives, and advanced search powers.
          </p>

          {/* Billing Switcher */}
          <div className="pricing-toggle-wrap" style={{ marginTop: '28px' }}>
            <div className="billing-pill">
              <button
                className={!annualBilling ? 'active' : ''}
                onClick={() => setAnnualBilling(false)}
              >
                Monthly
              </button>
              <button
                className={annualBilling ? 'active' : ''}
                onClick={() => setAnnualBilling(true)}
              >
                Annual Billing
              </button>
            </div>
            <span className="discount-badge">Save 20% • 2 Months Free</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards-grid">
          {plans.map((pl, i) => (
            <div 
              key={i} 
              className={`pricing-card ${pl.featured ? 'featured' : ''}`}
            >
              {pl.featured && (
                <div className="featured-ribbon">
                  ★ Most Popular
                </div>
              )}

              <h3 className="plan-name">{pl.name}</h3>
              <p className="plan-desc">{pl.desc}</p>

              <div className="plan-price-wrap">
                <span className="plan-price">{pl.price}</span>
                <span className="plan-period">{pl.period}</span>
              </div>

              <ul className="plan-features-list">
                {pl.features.map((feat, fIdx) => (
                  <li key={fIdx} className="plan-feature-item">
                    <Check size={16} className="feature-check-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`btn ${pl.featured ? 'btn-primary btn-glow' : 'btn-secondary'}`}
                style={{ width: '100%' }}
                onClick={pl.action}
              >
                <span>{pl.buttonText}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
