
import React from 'react';

interface ManifestoProps {
  onBack: () => void;
}

export const Manifesto: React.FC<ManifestoProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-fade-in-up pb-32">
       <button onClick={onBack} className="text-primary/60 hover:text-action transition-colors flex items-center gap-2 font-black uppercase tracking-widest text-xs group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Reality
      </button>

      <div className="relative text-center space-y-12">
        <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-[0.03]">
           <h1 className="text-[20rem] font-black">VOICE</h1>
        </div>

        <div className="space-y-6">
          <h1 className="text-7xl font-display font-black text-primary tracking-tighter">The Private Voice</h1>
          <p className="text-action text-sm font-black uppercase tracking-[0.5em]">A Manifesto for Unseen Governance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left pt-12">
          {[
            { 
              title: "Privacy is a Human Right", 
              content: "In a world of total transparency, there is no freedom. To vote is to exercise will; to do so under surveillance is to perform a script. We reclaim the secrecy of the ballot." 
            },
            { 
              title: "Decentralized, Not Exposed", 
              content: "Blockchain should not be a glass house for the weak to be watched by the strong. It must be a secure vault for collective intelligence." 
            },
            { 
              title: "The End of Coercion", 
              content: "When the result is unknown until the end, bribery loses its ledger. When identity is protected by math, retaliation becomes impossible." 
            },
            { 
              title: "Homomorphic Future", 
              content: "We believe in computing on private data without ever seeing it. This is not magic—it is the destiny of digital interaction." 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[48px] shadow-xl border-2 border-accent/5 hover:border-action transition-all group animate-fade-in-up" style={{ animationDelay: `${idx * 200}ms` }}>
              <h2 className="text-2xl font-display font-black text-primary mb-4 group-hover:text-action transition-colors">{item.title}</h2>
              <p className="text-primary/60 leading-relaxed font-medium">{item.content}</p>
            </div>
          ))}
        </div>

        <div className="pt-24 max-w-2xl mx-auto italic text-3xl font-display text-primary/20 leading-tight animate-pulse">
          "The most powerful voice is the one that is heard by all, yet known by none."
        </div>
      </div>
    </div>
  );
};
