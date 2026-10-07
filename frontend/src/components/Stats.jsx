import React from 'react';
import { Star, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function Stats() {
  const stats = [
    { number: '150,000+', label: 'Bookmarks Curated', icon: <Heart size={18} className="text-blue" /> },
    { number: '4.9 / 5.0', label: 'App Store Rating', icon: <Star size={18} color="#fbbf24" fill="#fbbf24" /> },
    { number: '< 12 ms', label: 'Instant Search Latency', icon: <Zap size={18} color="#38bdf8" /> },
    { number: '100% Private', label: 'Zero Ads & Zero Tracking', icon: <ShieldCheck size={18} color="#34d399" /> },
  ];

  return (
    <div className="stats-strip">
      <div className="container">
        <div className="stats-grid">
          {stats.map((st, idx) => (
            <div key={idx} className="stat-item">
              <div className="stat-item-number">{st.number}</div>
              <div className="stat-item-label">{st.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
