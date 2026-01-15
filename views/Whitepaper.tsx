
import React from 'react';

interface WhitepaperProps {
  onBack: () => void;
}

export const Whitepaper: React.FC<WhitepaperProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-fade-in-up pb-32">
      <button onClick={onBack} className="text-primary/60 hover:text-action transition-colors flex items-center gap-2 font-black uppercase tracking-widest text-xs group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Exit Archive
      </button>

      <div className="space-y-8">
        <div className="flex items-center gap-6 animate-fade-in-up stagger-1">
          <div className="w-20 h-20 bg-primary text-action flex items-center justify-center rounded-3xl text-3xl font-black shadow-2xl">W</div>
          <div>
            <h1 className="text-6xl font-display font-black text-primary tracking-tighter">Whitepaper</h1>
            <p className="text-action text-xs font-black uppercase tracking-[0.4em] opacity-80">Homomorphic Governance V1.0</p>
          </div>
        </div>

        <div className="prose prose-lg prose-slate max-w-none text-primary/70 leading-relaxed space-y-12 stagger-2 animate-fade-in-up">
          <section className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-primary tracking-tight">1. Abstract</h2>
            <p>
              Current on-chain voting mechanisms suffer from transparency paradoxes: while openness ensures auditability, it simultaneously exposes voter intent, enabling bribery, front-running, and coercion. SecureVote FHE introduces a protocol leveraging Fully Homomorphic Encryption (FHE) to facilitate end-to-end confidential voting where ballots are never unsealed individually.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-primary tracking-tight">2. The FHENIX Lifecycle</h2>
            <div className="bg-primary/5 rounded-[32px] p-8 space-y-6 border border-primary/5">
              {[
                { step: "01", title: "Key Exchange", desc: "The Fhenix Network generates a threshold-encrypted public key shared with all participants." },
                { step: "02", title: "Local Sealing", desc: "Using the public key, votes are encrypted on the user's browser via Cofhejs before reaching the network." },
                { step: "03", title: "Homomorphic Tallying", desc: "The smart contract computes the sum of encrypted votes without ever knowing individual values." },
                { step: "04", title: "Threshold Reveal", desc: "Only after the poll closes, a network of validators unseals the aggregate total, preserving individual anonymity." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <span className="text-action font-black text-xl">{item.step}</span>
                  <div>
                    <h3 className="text-primary font-bold">{item.title}</h3>
                    <p className="text-sm opacity-60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-primary tracking-tight">3. Cryptographic Security</h2>
            <p>
              Our protocol assumes a 2/3 threshold honesty within the validator set. Security is rooted in the Ring-Learning With Errors (RLWE) problem, ensuring that even with quantum-scale computing, the individual vote entropy remains protected.
            </p>
            <div className="bg-bone p-10 border-4 border-accent/10 rounded-[40px] font-mono text-sm shadow-inner relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-2 h-full bg-action/20" />
               <p className="text-primary/40 italic mb-4">// Simplified Homomorphic Addition</p>
               <p className="text-primary">Enc(V1) ⊕ Enc(V2) = Enc(V1 + V2)</p>
               <p className="mt-4 text-action/60 italic">// Individual Decryption is impossible</p>
               <p className="text-primary">Dec(Enc(V1)) → 0xERROR [Threshold Required]</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-primary tracking-tight">4. Conclusion</h2>
            <p>
              By decoupling auditability from transparency, SecureVote FHE provides the missing infrastructure for sovereign digital governance.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
