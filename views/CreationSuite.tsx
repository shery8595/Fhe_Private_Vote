
import React, { useState } from 'react';
import { CATEGORIES, LoadingSpinner } from '../constants';
import { POLL_TEMPLATES } from '../constants/pollTemplates';
import { GoogleGenAI, Type } from "@google/genai";
import { useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { createPollOnChain } from '../services/contractService';

// Duration options in minutes
const DURATION_OPTIONS = [
  { label: '3 min (Test)', value: 3, isTest: true },
  { label: '5 min (Test)', value: 5, isTest: true },
  { label: '10 min (Test)', value: 10, isTest: true },
  { label: '30 min', value: 30, isTest: false },
  { label: '1 hour', value: 60, isTest: false },
  { label: '1 day', value: 1440, isTest: false },
  { label: '7 days', value: 10080, isTest: false },
];

interface CreationSuiteProps {
  onBack: () => void;
  onCreated: (poll: any) => void;
}

export const CreationSuite: React.FC<CreationSuiteProps> = ({ onBack, onCreated }) => {
  const [step, setStep] = useState(1);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    category: CATEGORIES[0],
    options: ['', ''],
    durationMinutes: 3, // Default to 3 min for testing
    tokenGatingEnabled: false,
    tokenAddress: '',
    minimumTokenBalance: ''
  });

  const applyTemplate = (template: typeof POLL_TEMPLATES[0]) => {
    setFormData({
      question: template.question,
      description: template.description,
      category: template.category,
      options: [...template.options],
      durationMinutes: template.suggestedDuration,
      tokenGatingEnabled: template.tokenGatingEnabled || false,
      tokenAddress: template.tokenAddress || '',
      minimumTokenBalance: template.minimumTokenBalance || ''
    });
    setShowTemplates(false);
  };

  const generateWithAI = async () => {
    if (!formData.question) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am creating a private DAO poll. The question is: "${formData.question}". 
        Please provide a professional description and 3 relevant options for this poll.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['description', 'options']
          }
        }
      });

      const data = JSON.parse(response.text);
      setFormData(prev => ({
        ...prev,
        description: data.description,
        options: data.options
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addOption = () => {
    setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const updateOption = (index: number, val: string) => {
    const newOpts = [...formData.options];
    newOpts[index] = val;
    setFormData(prev => ({ ...prev, options: newOpts }));
  };

  const { data: walletClient } = useWalletClient();

  const handleSubmit = async () => {
    if (!walletClient) {
      alert('Please connect your wallet to deploy the poll');
      return;
    }

    setIsDeploying(true);
    try {
      const provider = new BrowserProvider(walletClient as any);
      const result = await createPollOnChain(
        formData.question,
        formData.description,
        formData.category,
        formData.durationMinutes,
        formData.options,
        provider,
        formData.tokenGatingEnabled ? formData.tokenAddress : undefined,
        formData.tokenGatingEnabled ? formData.minimumTokenBalance : undefined
      );

      if (result.success) {
        // After successful tx, notify parent
        onCreated({
          id: result.pollId?.toString() || '0',
          ...formData,
          status: 'ACTIVE',
          totalVotes: 0,
          endsAt: new Date(Date.now() + 1000 * 60 * formData.durationMinutes).toISOString(),
          creator: (await provider.getSigner()).address,
          options: formData.options.map((o, i) => ({ id: i.toString(), label: o }))
        });
      } else {
        alert(`Failed to deploy: ${result.error}`);
      }
    } catch (error) {
      console.error('Deployment error:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const selectedDuration = DURATION_OPTIONS.find(d => d.value === formData.durationMinutes);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-top-4 duration-700 pb-24">
      <button onClick={onBack} className="text-primary font-black uppercase tracking-widest text-xs hover:text-action flex items-center gap-3 transition-colors">
        <span className="text-lg">←</span> Abandon Protocol
      </button>

      <div className="bg-white rounded-[48px] overflow-hidden shadow-2xl border-4 border-accent/20">
        <div className="bg-primary p-12 md:p-16 text-bone space-y-4 relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-24 h-24" fill="white" viewBox="0 0 24 24">
              <path d="M12 2L3 19h18L12 2zM12 16a2 2 0 110 4 2 2 0 010-4z" />
            </svg>
          </div>
          <h1 className="text-5xl font-display font-black tracking-tighter">Creation Suite</h1>
          <p className="text-action text-lg font-medium opacity-80 uppercase tracking-widest">Deploy Encrypted Governance</p>
        </div>

        <div className="p-10 md:p-16 space-y-12">
          {/* Progress Path */}
          <div className="flex gap-6">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-action shadow-[0_0_10px_rgba(210,12,25,0.4)]' : 'bg-accent/10'}`}
              />
            ))}
          </div>

          {step === 1 ? (
            <div className="space-y-8">
              {/* Template Selection Button */}
              <button
                onClick={() => setShowTemplates(true)}
                className="w-full py-5 bg-gradient-to-r from-accent to-action text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:shadow-2xl transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                Use a Template
                <span className="text-white/60">→</span>
              </button>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-primary/40 ml-1">Classification</label>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFormData(f => ({ ...f, category: cat }))}
                      className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all ${formData.category === cat
                        ? 'border-accent bg-accent text-white shadow-inner'
                        : 'border-accent/10 text-primary/40 hover:border-action hover:text-action'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-primary/40 ml-1">Poll Question</label>
                <input
                  type="text"
                  placeholder="Describe your initiative..."
                  value={formData.question}
                  onChange={(e) => setFormData(f => ({ ...f, question: e.target.value }))}
                  className="w-full bg-bone border-4 border-accent/5 rounded-3xl px-8 py-6 text-2xl font-black text-primary focus:outline-none focus:border-action transition-all placeholder:text-primary/10 shadow-inner"
                />
              </div>

              <button
                disabled={!formData.question || isGenerating}
                onClick={generateWithAI}
                className="w-full py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-action transition-all disabled:opacity-30 group"
              >
                {isGenerating ? <LoadingSpinner className="w-6 h-6" /> : (
                  <>
                    <span className="text-action group-hover:text-white transition-colors">✨</span>
                    Gemini Smart Assist
                  </>
                )}
              </button>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-primary/40 ml-1">Governance Context</label>
                <textarea
                  rows={4}
                  placeholder="Provide detailed context for the cryptographic unsealing..."
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-bone border-4 border-accent/5 rounded-3xl px-8 py-6 focus:outline-none focus:border-action transition-all resize-none text-lg font-medium shadow-inner"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.question || !formData.description}
                className="w-full py-6 bg-action text-white rounded-3xl font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:bg-accent transition-all disabled:opacity-20 active:scale-95"
              >
                Configure Voting Options →
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="space-y-6">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-primary/40 ml-1">Encrypted Choice Parameters</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <input
                      type="text"
                      placeholder={`Choice Vector ${idx + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className="flex-1 bg-bone border-2 border-accent/10 rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none focus:border-action transition-all shadow-inner"
                    />
                    {formData.options.length > 2 && (
                      <button
                        onClick={() => setFormData(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))}
                        className="p-4 text-action hover:bg-action/10 rounded-2xl transition-colors border-2 border-transparent hover:border-action/20"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="w-full py-4 border-4 border-dashed border-accent/10 rounded-2xl text-primary/30 font-black uppercase tracking-widest text-[11px] hover:border-action hover:text-action transition-all"
                >
                  + Add New Choice Vector
                </button>
              </div>

              {/* Duration Selector */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.3em] text-primary/40 ml-1">Poll Duration</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormData(f => ({ ...f, durationMinutes: opt.value }))}
                      className={`px-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider border-2 transition-all ${formData.durationMinutes === opt.value
                        ? 'border-action bg-action text-white shadow-lg'
                        : opt.isTest
                          ? 'border-yellow-400/30 text-yellow-600 hover:border-yellow-400 bg-yellow-50'
                          : 'border-accent/10 text-primary/40 hover:border-action hover:text-action'
                        }`}
                    >
                      {opt.isTest && <span className="mr-1">⚡</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
                {selectedDuration?.isTest && (
                  <p className="text-xs text-yellow-600 font-medium flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl">
                    <span>⚠️</span> Test duration - poll will end quickly for decryption testing
                  </p>
                )}
              </div>

              {/* Token-Gating Configuration */}
              <div className="space-y-4 border-t-2 border-accent/10 pt-8">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-primary/40">Token-Gating (Optional)</label>
                  <button
                    onClick={() => setFormData(f => ({ ...f, tokenGatingEnabled: !f.tokenGatingEnabled }))}
                    className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider border-2 transition-all ${formData.tokenGatingEnabled
                      ? 'border-action bg-action text-white shadow-lg'
                      : 'border-accent/10 text-primary/40 hover:border-action hover:text-action'
                      }`}
                  >
                    {formData.tokenGatingEnabled ? '✓ Enabled' : 'Disabled'}
                  </button>
                </div>

                {formData.tokenGatingEnabled && (
                  <div className="space-y-4 bg-bone rounded-3xl p-6 border-2 border-action/10 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/60">ERC20 Token Address</label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={formData.tokenAddress}
                        onChange={(e) => setFormData(f => ({ ...f, tokenAddress: e.target.value }))}
                        className="w-full bg-white border-2 border-accent/10 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-action transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/60">Minimum Token Balance (in wei)</label>
                      <input
                        type="text"
                        placeholder="1000000000000000000 (1 token with 18 decimals)"
                        value={formData.minimumTokenBalance}
                        onChange={(e) => setFormData(f => ({ ...f, minimumTokenBalance: e.target.value }))}
                        className="w-full bg-white border-2 border-accent/10 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-action transition-all shadow-inner"
                      />
                      <p className="text-xs text-primary/40 italic">Note: For most tokens with 18 decimals, 1 token = 1000000000000000000 wei</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-10 flex flex-col md:flex-row gap-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-6 bg-bone border-2 border-accent/20 text-accent rounded-3xl font-black uppercase tracking-widest text-xs hover:border-accent transition-all"
                >
                  Return to Context
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isDeploying}
                  className="flex-[2] py-6 bg-action text-white rounded-3xl font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:bg-accent transition-all shadow-action/20 disabled:opacity-50"
                >
                  {isDeploying ? <LoadingSpinner className="w-6 h-6 mx-auto" /> : 'Finalize & Deploy Protocol'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowTemplates(false)}>
          <div className="bg-white rounded-[48px] max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl border-4 border-accent/20 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-primary to-accent p-10 text-bone sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-display font-black tracking-tighter">Poll Templates</h2>
                  <p className="text-action text-sm font-medium opacity-80 uppercase tracking-widest mt-2">Start with a pre-built template</p>
                </div>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-4 hover:bg-white/10 rounded-2xl transition-colors text-3xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {POLL_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyTemplate(template)}
                    className="bg-bone border-2 border-accent/10 rounded-3xl p-6 hover:border-action hover:shadow-xl transition-all group text-left"
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{template.icon}</div>
                    <h3 className="font-black text-lg text-primary mb-2 group-hover:text-action transition-colors">{template.name}</h3>
                    <p className="text-xs text-primary/50 uppercase tracking-wider font-bold mb-3">{template.category}</p>
                    <p className="text-sm text-primary/60 line-clamp-2">{template.description}</p>
                    <div className="mt-4 pt-4 border-t border-accent/10 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-primary/40 font-black">{template.options.length} options</span>
                      <span className="text-action text-xs font-bold group-hover:translate-x-1 transition-transform">Use →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
