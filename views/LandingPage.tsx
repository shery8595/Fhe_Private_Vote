
import React, { useState, useEffect } from 'react';
import { ShieldIcon } from '../constants';

interface LandingPageProps {
  onEnter: () => void;
  onViewWhitepaper: () => void;
  onViewManifesto: () => void;
  onViewTechnology: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onEnter, 
  onViewWhitepaper, 
  onViewManifesto, 
  onViewTechnology 
}) => {
  const words = ["PRIVATE", "SECURE", "ENCRYPTED", "UNBIASED", "FAIR"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const fullWord = words[currentWordIndex];
      
      if (isDeleting) {
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setTypingSpeed(40);
      } else {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        setTypingSpeed(120);
      }

      if (!isDeleting && currentText === fullWord) {
        setTimeout(() => setIsDeleting(true), 1800);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, typingSpeed]);

  return (
    <div className="min-h-screen bg-bone flex flex-col relative overflow-hidden">
      {/* Scanner Overlay */}
      <div className="scanner-line" />

      {/* Dynamic Animated Blobs */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-action/5 rounded-full blur-[140px] -mr-[400px] -mt-[400px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] -ml-[300px] -mb-[300px] pointer-events-none" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-4 h-4 bg-action/20 rounded-full animate-float" />
        <div className="absolute top-1/3 right-[15%] w-6 h-6 bg-accent/10 rounded-full animate-float stagger-2" />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-action/30 rounded-full animate-float stagger-4" />
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-accent/40 rounded-full animate-float stagger-1" />
      </div>

      {/* Header */}
      <header className="px-8 py-10 flex justify-between items-center relative z-10 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-2.5 rounded-xl shadow-2xl border border-white/10 group cursor-default">
            <svg className="w-6 h-6 group-hover:rotate-[360deg] transition-transform duration-700" fill="#D20C19" viewBox="0 0 24 24">
              <path d="M12 2L3 19h18L12 2zM12 16a2 2 0 110 4 2 2 0 010-4z" />
            </svg>
          </div>
          <span className="text-xl font-display font-black tracking-tighter uppercase text-primary">
            SecureVote <span className="text-action">FHE</span>
          </span>
        </div>
        <div className="hidden md:flex gap-10 items-center text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
          <button onClick={onViewTechnology} className="hover:text-action transition-all hover:tracking-[0.4em]">Technology</button>
          <button onClick={onViewManifesto} className="hover:text-action transition-all hover:tracking-[0.4em]">Manifesto</button>
          <button onClick={() => window.open('https://fhenix.zone', '_blank')} className="hover:text-action transition-all hover:tracking-[0.4em]">Fhenix Network</button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary text-bone rounded-full mb-12 animate-fade-in-up stagger-1 border border-white/5 shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-action animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Protocol Status: Operational • Beta V1.4</span>
        </div>

        <h1 className="text-6xl md:text-9xl font-display font-black text-primary tracking-tighter leading-[0.85] mb-10 animate-fade-in-up stagger-2">
          GOVERNANCE <br />
          <span className="relative inline-block text-action drop-shadow-[0_0_25px_rgba(210,12,25,0.3)] min-h-[1.1em] min-w-[5ch]">
            {currentText}
            <span className="inline-block w-1.5 md:w-3 h-[0.85em] bg-action ml-2 align-middle animate-blink" />
          </span> 
          <br />
          BY DESIGN
        </h1>

        <p className="text-xl md:text-3xl text-primary/40 font-medium max-w-3xl mb-16 animate-fade-in-up stagger-3 leading-tight tracking-tight">
          Privacy isn't a feature—it's the core. Participate in decisions where 
          <span className="text-primary font-bold"> local encryption </span> 
          ensures your vote is computed, but never seen.
        </p>

        <div className="flex flex-col sm:flex-row gap-8 animate-fade-in-up stagger-4 w-full justify-center">
          <button 
            onClick={onEnter}
            className="px-16 py-7 bg-action text-white rounded-[2rem] font-black uppercase tracking-[0.35em] text-sm shadow-[0_20px_60px_-15px_rgba(210,12,25,0.4)] hover:bg-primary hover:-translate-y-2 transition-all active:scale-95 flex items-center justify-center gap-4 group overflow-hidden relative"
          >
            <span className="relative z-10">Launch Protocol</span>
            <span className="group-hover:translate-x-2 transition-transform relative z-10 text-xl">→</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
          <button 
            onClick={onViewWhitepaper}
            className="px-16 py-7 bg-white border-2 border-accent/10 text-primary rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:border-action transition-all group overflow-hidden relative hover:shadow-2xl hover:-translate-y-1"
          >
            <span className="relative z-10">Read Whitepaper</span>
            <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>

        {/* Technical Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-28 w-full animate-fade-in-up stagger-5">
          {[
            { 
              title: "Homomorphic Tally", 
              desc: "Smart contracts sum encrypted ballots. Math ensures the total is accurate; privacy ensures individual choices are voided from observation.",
              icon: <ShieldIcon className="w-8 h-8 text-action" />
            },
            { 
              title: "Threshold Reveal", 
              desc: "Aggregated results are unsealed only by network consensus. No single entity—not even the validators—can ever see your ballot.",
              icon: (
                <svg className="w-8 h-8 text-action" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              )
            },
            { 
              title: "Quantum Proof", 
              desc: "Rooted in Lattice-based cryptography. Our encryption remains resilient even in the age of emerging quantum computation.",
              icon: (
                <svg className="w-8 h-8 text-action" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.346a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.022.547l-1.16 1.16a2 2 0 000 2.828l1.16 1.16a2 2 0 002.828 0l1.16-1.16a2 2 0 00.547-1.022l.477-2.387a6 6 0 01.517-3.86l.346-.691a6 6 0 00.517-3.86l-.477-2.388a2 2 0 00-.547-1.022l-1.16-1.16a2 2 0 00-2.828 0l-1.16 1.16a2 2 0 000 2.828l1.16 1.16z" />
                </svg>
              )
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-accent/5 hover:border-action/20 transition-all text-left group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-2">
              <div className="mb-8 group-hover:scale-110 transition-transform duration-500 bg-action/5 w-20 h-20 rounded-[1.5rem] flex items-center justify-center">{item.icon}</div>
              <h3 className="text-xl font-black text-primary uppercase tracking-tight mb-3 group-hover:text-action transition-colors">{item.title}</h3>
              <p className="text-sm text-primary/50 font-medium leading-relaxed group-hover:text-primary/70 transition-colors">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#1E293B 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <footer className="px-12 py-12 relative z-10 animate-fade-in-up text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8 border-t border-accent/5 mt-auto bg-white/20 backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">
            SecureVote Architecture • © 2025 Protocol Foundation
          </p>
          <p className="text-[9px] font-bold text-action uppercase tracking-widest opacity-60">Powered by Fhenix & Arbitrum Nitro</p>
        </div>
        <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">
          <span className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> API: STABLE
          </span>
          <span className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> NODES: ONLINE
          </span>
        </div>
      </footer>
    </div>
  );
};
