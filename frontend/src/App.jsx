import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';

import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Comparison from './components/Comparison';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import TermsOfUse from './components/TermsOfUse';
import PrivacyPolicy from './components/PrivacyPolicy';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'terms' | 'privacy'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Handle URL hash routing (e.g., #terms or #privacy)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#terms' || hash === '#terms-of-use') {
        setCurrentView('terms');
      } else if (hash === '#privacy' || hash === '#privacy-policy') {
        setCurrentView('privacy');
      } else if (hash === '#home' || hash === '') {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const navigateToView = (view) => {
    setCurrentView(view);
    if (view === 'terms') {
      window.location.hash = 'terms';
    } else if (view === 'privacy') {
      window.location.hash = 'privacy';
    } else {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <div className="app-wrapper">
      {/* Dynamic Ambient Background Elements */}
      <div className="ambient-glow"></div>
      <div className="grid-pattern"></div>

      {/* Global Navigation Header */}
      <Navbar 
        currentView={currentView}
        setCurrentView={navigateToView}
        openAuthModal={openAuthModal}
      />

      {/* Main View Router */}
      <main>
        {currentView === 'home' && (
          <>
            <Hero 
              openAuthModal={openAuthModal}
            />
            <Stats />
            <Features />
            <HowItWorks />
            <Comparison />
            <Testimonials />
            <Pricing openAuthModal={openAuthModal} />
            <FAQ />
            <CTA openAuthModal={openAuthModal} />
          </>
        )}

        {currentView === 'terms' && (
          <TermsOfUse onBack={() => navigateToView('home')} />
        )}

        {currentView === 'privacy' && (
          <PrivacyPolicy onBack={() => navigateToView('home')} />
        )}
      </main>

      {/* Global Interactive Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={closeAuthModal}
      />

      {/* Global Footer */}
      <Footer 
        setCurrentView={navigateToView}
        openAuthModal={openAuthModal}
      />
    </div>
  );
}
