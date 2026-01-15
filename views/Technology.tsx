
import React from 'react';

interface TechnologyProps {
  onBack: () => void;
}

export const Technology: React.FC<TechnologyProps> = ({ onBack }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-fade-in-up pb-32">
       <button onClick={onBack} className="text-primary/40 hover:text-action transition-all flex items-center gap-3 font-black uppercase tracking-widest text-[10px] group">
        <span className="group-hover:-translate-x-2 transition-transform text-lg">←</span> TERMINAL_EXIT_CMD
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
           <div className="inline-flex gap-3 px-5 py-2 bg-action/5 rounded-full border border-action/20">
              <div className="w-2 h-2 rounded-full bg-action animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-action">Diagnostics: v4.0.2 Stable</span>
           </div>
           <h1 className="text-7xl md:text-9xl font-display font-black text-primary tracking-tighter leading-[0.8]">
             THE <span className="text-action">FHE</span><br />
             STACK
           </h1>
           <p className="text-2xl text-primary/40 font-medium leading-tight max-w-lg">
             Merging the speed of optimistic rollups with the absolute privacy of homomorphic math.
           </p>
           
           <div className="flex gap-4">
              <div className="h-1 w-20 bg-action" />
              <div className="h-1 w-12 bg-primary/10" />
              <div className="h-1 w-8 bg-primary/10" />
           </div>
        </div>

        <div className="bg-primary rounded-[4rem] p-12 md:p-16 text-bone space-y-12 shadow-2xl relative overflow-hidden group border border-white/5">
           <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-action/10 rounded-full blur-[100px] group-hover:bg-action/20 transition-all duration-1000" />
           
           {[
             { title: "FHENIX NETWORK", desc: "Native FHE-EVM enabling encrypted state transitions without unsealing individual data points.", tech: "TFHE-EVM" },
             { title: "THRESHOLD DECRYPTION", desc: "Decentralized unsealing mechanism requiring 2/3 validator honesty to reveal aggregate results.", tech: "TSS-Reveal" },
             { title: "L3 SETTLEMENT", desc: "Settling on Arbitrum Orbit for hyper-scalability and minimal gas footprint for private transactions.", tech: "Nitro Rollup" }
           ].map((item, idx) => (
             <div key={idx} className="space-y-5 animate-fade-in-up" style={{ animationDelay: `${idx * 200}ms` }}>
                <div className="flex justify-between items-end">
                   <h3 className="text-3xl font-black tracking-tighter uppercase">{item.title}</h3>
                   <span className="px-4 py-1.5 bg-action/20 rounded-xl text-[9px] font-black tracking-[0.3em] text-action border border-action/20 uppercase">{item.tech}</span>
                </div>
                <p className="opacity-40 text-sm leading-relaxed font-medium">{item.desc}</p>
                <div className="h-[1px] bg-white/10 w-full" />
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-16">
        {[
          { label: "Latent Latency", val: "0.85s", sub: "Avg Encryption Time" },
          { label: "Security Parameter", val: "λ=128", sub: "Quantum-Safe Security" },
          { label: "Throughput", val: "1.2k", sub: "Enc-TX Per Second" }
        ].map((item, idx) => (
          <div key={idx} className="p-12 bg-white border-2 border-accent/5 rounded-[3.5rem] space-y-5 hover:border-action hover:shadow-2xl transition-all animate-fade-in-up" style={{ animationDelay: `${(idx + 3) * 150}ms` }}>
             <h4 className="font-black text-primary/30 uppercase text-[10px] tracking-[0.3em]">{item.label}</h4>
             <div className="text-6xl font-black text-primary tracking-tighter">{item.val}</div>
             <p className="text-[11px] text-action font-black uppercase tracking-widest">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
