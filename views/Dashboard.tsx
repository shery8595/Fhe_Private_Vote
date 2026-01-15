
import React, { useState } from 'react';
import { Poll, PollStatus } from '../types';
import { PollCard } from '../components/PollCard';
import { CATEGORIES } from '../constants';

interface DashboardProps {
  polls: Poll[];
  onViewPoll: (id: string) => void;
  onCreate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ polls, onViewPoll, onCreate }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPolls = polls.filter(p => {
    const matchesSearch = p.question.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b-2 border-accent/10 pb-8 animate-fade-in-up">
        <div className="space-y-3">
          <h1 className="text-5xl font-display font-black text-primary tracking-tighter">Governance</h1>
          <p className="text-primary/50 font-medium text-lg">Securely participate in the future of the Fhenix ecosystem.</p>
        </div>
        <button
          onClick={onCreate}
          className="bg-action text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary transition-all duration-300 shadow-2xl hover:shadow-primary/20 flex items-center gap-3 active:scale-95 group"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span> Create New Poll
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-center animate-fade-in-up stagger-1">
        <div className="relative flex-1 w-full group">
          <input
            type="text"
            placeholder="Search decentralized initiatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-accent/20 rounded-2xl px-8 py-5 text-lg focus:outline-none focus:border-action transition-all shadow-sm placeholder:text-primary/20 group-hover:border-accent/40"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto w-full lg:w-auto pb-4 lg:pb-0 no-scrollbar">
          {['All', ...CATEGORIES].map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 active:scale-90 ${
                activeCategory === cat 
                ? 'bg-accent text-white border-accent shadow-lg scale-105' 
                : 'bg-white text-primary/40 border-accent/20 hover:border-action hover:text-action'
              }`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredPolls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredPolls.map((poll, idx) => (
            <PollCard 
              key={poll.id} 
              poll={poll} 
              onView={onViewPoll} 
              index={idx} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] py-32 text-center border-4 border-dashed border-accent/10 animate-scale-in">
          <div className="mb-6 inline-block p-6 bg-accent/5 rounded-full animate-bounce">
            <svg className="w-12 h-12 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-primary/30 font-black uppercase tracking-[0.3em] text-sm">No encrypted protocols found</p>
        </div>
      )}
    </div>
  );
};
