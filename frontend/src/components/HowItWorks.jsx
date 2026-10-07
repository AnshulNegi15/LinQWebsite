import React from 'react';
import { Share2, Cpu, Sparkles, Search, Layers, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Clip in One Tap',
      desc: 'Use the native iOS share sheet, browser extension, or hotkey Cmd+Shift+L to capture any tab without leaving your flow.',
      icon: <Share2 size={24} />,
      badge: 'Native Share Sheet',
    },
    {
      num: '02',
      title: 'LinQ Auto-Enriches',
      desc: 'Our engine extracts 4K media thumbnails, OpenGraph data, author avatars, and categorizes links into your active Space.',
      icon: <Cpu size={24} />,
      badge: 'Zero Manual Tagging',
    },
    {
      num: '03',
      title: 'Rediscover Seamlessly',
      desc: 'Browse visual physical card stacks or use fuzzy search to retrieve any bookmark in less than 12 milliseconds.',
      icon: <Layers size={24} />,
      badge: 'Sub-12ms Recall',
    },
  ];

  return (
    <section className="steps-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Sparkles size={14} />
            <span>Effortless Workflow</span>
          </div>
          <h2 className="section-title">
            From Tab Overload to <span className="text-gradient">Total Clarity</span>
          </h2>
          <p className="section-subtitle">
            Say goodbye to messy tab groups and endless bookmarks bars. LinQ works quietly in the background 
            to keep your digital space pristine.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((st, i) => (
            <div key={i} className="step-card">
              <span className="step-number">{st.num}</span>
              <div className="step-icon">{st.icon}</div>
              <div style={{ marginBottom: '12px' }}>
                <span className="app-pill-badge">{st.badge}</span>
              </div>
              <h3 className="step-title">{st.title}</h3>
              <p className="step-desc">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
