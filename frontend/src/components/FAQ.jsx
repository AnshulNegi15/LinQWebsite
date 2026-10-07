import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How is LinQ different from my browser’s native bookmarks bar?',
      a: 'Standard browser bookmark bars store links as flat text strings inside archaic folder trees that are awkward to navigate. LinQ renders bookmarks as physical visual card decks with rich 4K thumbnails, extracted metadata, domain favicons, and segregated Spaces (e.g. Work, Tech, Design). You also get sub-12ms fuzzy search and instant cross-device synchronization.',
    },
    {
      q: 'Can I import my existing bookmarks from Google Chrome, Safari, or Pocket?',
      a: 'Yes, absolutely. LinQ features an effortless 1-click HTML bookmark import tool. Simply export your bookmarks from Chrome, Safari, Firefox, Arc, or Pocket, drag the file into LinQ settings, and our engine will automatically parse them, fetch high-resolution previews, and group them into smart collections.',
    },
    {
      q: 'How does rich media preview extraction work?',
      a: 'When you save a link from platforms like YouTube, Hotstar, Vimeo, Substack, GitHub, or Figma, LinQ’s privacy-preserving scraper fetches the official OpenGraph metadata, high-definition thumbnail preview, and title tags in real-time, letting you browse your bookmarks with streaming-service quality aesthetics.',
    },
    {
      q: 'Is my data secure and private?',
      a: 'Yes. LinQ is built on a zero-knowledge, privacy-first architecture. We never sell your bookmark data, inject affiliate tracking links, or run ads. All your links, tags, and collections are encrypted both in transit (TLS 1.3) and at rest (AES-256).',
    },
    {
      q: 'What platforms does LinQ support?',
      a: 'LinQ is available natively on iOS 18+ (iPhone & iPad), macOS Sequoia, modern web browsers, and as lightweight extensions for Google Chrome, Apple Safari, Brave, and Edge.',
    },
    {
      q: 'Can I export my data anytime?',
      a: 'Of course! You have 100% data ownership. You can export your entire collection at any time in standard formats including JSON, Markdown, CSV, or standard HTML bookmark file format with a single click.',
    },
  ];

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <HelpCircle size={14} />
            <span>Got Questions?</span>
          </div>
          <h2 className="section-title">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="section-subtitle">
            Everything you need to know about LinQ’s visual bookmarking technology, privacy model, and platform support.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`faq-item ${openIndex === i ? 'active' : ''}`}
            >
              <button 
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={20} 
                  style={{ 
                    transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                    color: openIndex === i ? '#3b82f6' : '#94a3b8',
                    flexShrink: 0
                  }} 
                />
              </button>

              {openIndex === i && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
