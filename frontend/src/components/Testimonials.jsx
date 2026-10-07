import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Sarah Chen',
      role: 'Staff Product Designer @ Stripe',
      text: 'LinQ completely replaced my 200+ Chrome tabs. The visual card decks give me the tactile feeling of physical index cards, but with 4K thumbnails and instant search. Absolutely indispensable for design research.',
      stars: 5,
      avatarInitials: 'SC',
      avatarBg: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    },
    {
      name: 'Alex Rivera',
      role: 'Founding Engineer @ DevScale',
      text: 'The sub-12ms fuzzy search is ridiculous. I can recall a GitHub PR discussion or Vite documentation snippet from 6 months ago in half a keystroke. And zero ads or analytics tracking is huge for our security standards.',
      stars: 5,
      avatarInitials: 'AR',
      avatarBg: 'linear-gradient(135deg, #2563eb, #38bdf8)',
    },
    {
      name: 'Priya Patel',
      role: 'AI Researcher & Curator',
      text: 'Having distinct Spaces for arXiv papers, generative models, and personal reading without tab cross-contamination is a breath of fresh air. LinQ’s mobile app feels faster than Apple’s first-party apps.',
      stars: 5,
      avatarInitials: 'PP',
      avatarBg: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    },
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Star size={14} fill="#fbbf24" color="#fbbf24" />
            <span>Community Love</span>
          </div>
          <h2 className="section-title">
            Loved by Builders, <span className="text-gradient">Curators, and Thinkers</span>
          </h2>
          <p className="section-subtitle">
            See how LinQ helps tens of thousands of professionals turn chaotic web exploration into 
            organized visual knowledge.
          </p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((rev, i) => (
            <div key={i} className="testimonial-card">
              <div>
                <div className="rating-stars">
                  {[...Array(rev.stars)].map((_, sIdx) => (
                    <Star key={sIdx} size={16} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <p className="testimonial-text">"{rev.text}"</p>
              </div>

              <div className="testimonial-author">
                <div className="author-avatar" style={{ background: rev.avatarBg }}>
                  {rev.avatarInitials}
                </div>
                <div>
                  <div className="author-name">{rev.name}</div>
                  <div className="author-role">{rev.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
