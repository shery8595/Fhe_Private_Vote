
import React from 'react';
import { Poll, PollStatus } from '../types';
import { ShieldIcon } from '../constants';

interface PollCardProps {
  poll: Poll;
  onView: (id: string) => void;
  index?: number;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, onView, index = 0 }) => {
  const isClosed = poll.status === PollStatus.CLOSED || poll.status === PollStatus.REVEALED;
  const statusColor = isClosed ? 'bg-primary/10 text-primary' : 'bg-action text-white';
  const delayClass = `stagger-${(index % 5) + 1}`;

  return (
    <div 
      className={`bg-white rounded-[24px] p-8 shadow-sm border-2 border-accent/10 hover:border-action transition-all duration-300 group relative overflow-hidden active:scale-[0.98] animate-fade-in-up ${delayClass}`}
    >
      <div className="flex justify-between items-start mb-6">
        <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/10 group-hover:bg-primary/10 transition-colors">
          {poll.category}
        </span>
        <span className={`px-4 py-1 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm transition-transform group-hover:scale-105 ${statusColor}`}>
          {poll.status}
        </span>
      </div>

      <h3 className="text-2xl font-display font-bold text-primary mb-3 leading-tight group-hover:text-action transition-colors duration-300">
        {poll.question}
      </h3>
      
      <p className="text-primary/60 text-sm mb-8 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
        {poll.description}
      </p>

      <div className="space-y-5">
        <div className="flex items-center justify-between text-[11px] font-bold text-primary/40 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldIcon className={`w-4 h-4 text-action ${!isClosed ? 'animate-pulse' : ''}`} />
            <span className="group-hover:text-primary transition-colors">{poll.totalVotes} Encrypted Votes</span>
          </div>
          <span className="group-hover:text-action transition-colors">{isClosed ? 'Concluded' : '2d Left'}</span>
        </div>

        {!isClosed && (
          <div className="w-full bg-accent/10 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-action h-full w-2/3 rounded-full shadow-[0_0_10px_rgba(210,12,25,0.3)] transition-all duration-1000 group-hover:w-[75%]" 
            />
          </div>
        )}
      </div>

      <button
        onClick={() => onView(poll.id)}
        className="w-full mt-8 py-4 px-4 rounded-2xl bg-action text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/20"
      >
        {isClosed ? 'Review Results' : 'Seal Vote Now'}
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  );
};
