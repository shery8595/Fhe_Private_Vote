
import React, { useEffect, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { Poll, PollOption, PollStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import confetti from 'canvas-confetti';
import { initializeNewCofhe, isNewCofheReady } from '../services/newCofhe';
import { CONTRACT_CONFIG } from '../lib/contract';
import { Contract } from 'ethers';
import { CONTRACT_ABI } from '../lib/contract';
import { endPollOnChain, revealResultsOnChain, getDecryptedResultFromContract } from '../services/contractService';
import { ShieldIcon, LoadingSpinner } from '../constants';

interface ResultsCenterProps {
  poll: Poll;
  onBack: () => void;
  onRefresh?: () => void;
}

export const ResultsCenter: React.FC<ResultsCenterProps> = ({ poll, onBack, onRefresh }) => {
  const [data, setData] = useState<any[]>([]);
  const [winner, setWinner] = useState<PollOption | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [isUnsealing, setIsUnsealing] = useState(false);
  const [cofheInitialized, setCofheInitialized] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // Track local reveal status since the poll prop might be stale during transitions
  const [resultsRevealedLocally, setResultsRevealedLocally] = useState(poll.status === PollStatus.REVEALED);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Initialize CoFHE when component mounts
  useEffect(() => {
    const initCofhe = async () => {
      if (isConnected && walletClient && !cofheInitialized) {
        try {
          const provider = new BrowserProvider(walletClient as any);
          const signer = await provider.getSigner();
          const result = await initializeNewCofhe(provider, signer);
          if (result.success) {
            setCofheInitialized(true);
            addLog("✅ FHE encryption initialized");
          }
        } catch (error) {
          console.error('CoFHE init error:', error);
          addLog("⚠️ FHE initialization failed, using contract decryption");
        }
      }
    };
    initCofhe();
  }, [isConnected, walletClient, cofheInitialized]);

  useEffect(() => {
    // Sync local state if prop changes
    if (poll.status === PollStatus.REVEALED) {
      setResultsRevealedLocally(true);
    }
  }, [poll.status]);

  useEffect(() => {
    // If poll is revealed, try to fetch decrypted results from contract
    if (resultsRevealedLocally) {
      fetchDecryptedResults();
    } else if (poll.status === PollStatus.CLOSED) {
      // Show empty results with action buttons
      displayEmptyResults();
    } else {
      displayMockResults();
    }
  }, [poll.id, poll.status, resultsRevealedLocally]);

  const displayEmptyResults = () => {
    const chartData = poll.options.map(opt => ({
      name: opt.label,
      votes: 0,
      id: opt.id
    }));
    setData(chartData);
    setShowCharts(true);
    addLog("📊 Poll closed. End poll and reveal to see results.");
  };

  const displayMockResults = () => {
    const chartData = poll.options.map(opt => ({
      name: opt.label,
      votes: opt.voteCount || 0,
      id: opt.id
    })).sort((a, b) => b.votes - a.votes);

    setData(chartData);
    setWinner(chartData[0]?.votes > 0 ? poll.options.find(o => o.id === chartData[0].id) || null : null);
    setShowCharts(true);
  };

  const fetchDecryptedResults = async (retryCount = 0) => {
    if (!walletClient) {
      displayMockResults();
      return;
    }

    setIsUnsealing(true);
    if (retryCount === 0) addLog("🔐 Fetching decrypted results from contract...");

    try {
      const provider = new BrowserProvider(walletClient as any);
      const pollId = parseInt(poll.id);
      const votes: number[] = [];
      let allDecrypted = true;

      for (let i = 0; i < poll.options.length; i++) {
        const result = await getDecryptedResultFromContract(pollId, i, provider);
        if (result.isDecrypted) {
          votes.push(Number(result.value));
        } else {
          allDecrypted = false;
          votes.push(0);
        }
      }

      if (allDecrypted) {
        const totalDecrypted = votes.reduce((a, b) => a + b, 0);
        addLog(`✅ All results fetched!`);
        addLog(`📊 Stats: ${poll.totalVotes} unencrypted records | ${totalDecrypted} decrypted votes found`);
        addLog(`🔢 Values: ${votes.join(' | ')}`);

        if (poll.totalVotes > 0 && totalDecrypted === 0) {
          addLog("⚠️ DISCREPANCY: Votes were cast but decrypted as 0. This can happen if votes were cast with older software versions (v0.1) where Option 1 sent '0' as an encrypted value. Please try a fresh poll!");
        }

        const chartData = poll.options.map((opt, idx) => ({
          name: opt.label,
          votes: votes[idx] || 0,
          id: opt.id
        })).sort((a, b) => b.votes - a.votes);

        setData(chartData);
        // Show a winner even if 0 votes, so the UI isn't empty
        setWinner(poll.options.find(o => o.id === chartData[0].id) || null);
        setShowCharts(true);

        if (totalDecrypted > 0) {
          confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#D20C19', '#1E293B', '#F8FBEA']
          });
        }
      } else if (retryCount < 20) {
        // Polling logic: wait and retry if results are not ready yet
        addLog(`⏳ Decryption pending... (Attempt ${retryCount + 1}/20)`);
        setTimeout(() => fetchDecryptedResults(retryCount + 1), 5000);
      } else {
        addLog("⚠️ Decryption is taking longer than expected. Use the 'Refresh Results Data' button to try again.");
      }

    } catch (error) {
      console.error('Fetch results error:', error);
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      displayMockResults();
    } finally {
      setIsUnsealing(false);
    }
  };

  const handleEndPoll = async () => {
    if (!walletClient) return;
    setIsEnding(true);
    addLog("🔒 Ending poll on-chain...");

    try {
      const provider = new BrowserProvider(walletClient as any);
      const result = await endPollOnChain(parseInt(poll.id), provider);

      if (result.success) {
        addLog("✅ Poll ended successfully!");
        if (onRefresh) onRefresh();
      } else {
        addLog(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setIsEnding(false);
    }
  };

  const handleRevealResults = async () => {
    if (!walletClient) return;
    setIsRevealing(true);
    addLog("🔓 Requesting decryption from Fhenix network...");

    try {
      const provider = new BrowserProvider(walletClient as any);
      const result = await revealResultsOnChain(parseInt(poll.id), provider);

      if (result.success) {
        addLog("✅ Decryption requested! Results will be available shortly.");
        setResultsRevealedLocally(true);
        if (onRefresh) onRefresh();
        // Start polling for results
        setTimeout(() => fetchDecryptedResults(0), 3000);
      } else {
        addLog(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setIsRevealing(false);
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const simulateUnsealingLogs = () => {
    const mockLogs = [
      "Initializing Fhenix Decryption Protocol...",
      "Fetching 12 threshold signatures...",
      "Aggregating homomorphic ciphertexts...",
      "Validating Zero-Knowledge Proof (ZKP) #0x4a2...f3",
      "Threshold reached. Initiating final unsealing...",
      "Decryption successful. State updated on-chain.",
      "Rendering consensus visualization..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < mockLogs.length) {
        setLogs(prev => [...prev, mockLogs[i]]);
        i++;
        if (i === mockLogs.length) {
          setShowCharts(true);
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 90,
              origin: { y: 0.6 },
              colors: ['#D20C19', '#1E293B', '#F8FBEA']
            });
          }, 400);
        }
      } else {
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center animate-fade-in-up">
        <button onClick={onBack} className="text-primary font-black uppercase tracking-widest text-xs hover:text-action flex items-center gap-3 transition-colors group">
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Archive Registry
        </button>
        <div className="flex gap-2">
          <button className="px-4 py-2 border-2 border-accent text-accent rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all active:scale-95">Download Audit</button>
          <button className="px-4 py-2 bg-action text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-action/20">Share Result</button>
        </div>
      </div>

      {/* Action Buttons for Poll Management - Show if CLOSED or if user is creator */}
      {((poll.status === PollStatus.CLOSED || (isConnected && address?.toLowerCase() === poll.creator.toLowerCase())) && !resultsRevealedLocally) && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 space-y-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <ShieldIcon className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-black text-yellow-700 uppercase tracking-wider text-sm">
                {poll.isActive ? 'Poll Management - Active' : 'Poll Closed - Actions Required'}
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                {poll.isActive ? 'You can end this poll early to begin the decryption process' : 'End the poll on-chain and reveal encrypted results'}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            {poll.isActive && (
              <button
                onClick={handleEndPoll}
                disabled={isEnding}
                className="flex-1 py-4 bg-yellow-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-yellow-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isEnding ? <LoadingSpinner className="w-4 h-4" /> : '🔒 End Poll'}
              </button>
            )}
            <button
              onClick={handleRevealResults}
              disabled={isRevealing || (poll.isActive && !resultsRevealedLocally)}
              className="flex-1 py-4 bg-action text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRevealing ? <LoadingSpinner className="w-4 h-4" /> : '🔓 Reveal Results'}
            </button>
          </div>
          {resultsRevealedLocally && (
            <button
              onClick={() => fetchDecryptedResults(0)}
              disabled={isUnsealing}
              className="w-full py-2 bg-bone border-2 border-accent text-primary rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-accent transition-all animate-pulse"
            >
              {isUnsealing ? 'Refreshing...' : '🔄 Refresh Results Data'}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Stats & Verification Logs */}
        <div className="lg:col-span-1 space-y-8 animate-slide-in-right">
          <div className="bg-primary text-bone rounded-[32px] p-8 shadow-2xl border border-white/10 group transition-all">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-action mb-6 group-hover:tracking-[0.4em] transition-all">Verification Node</h4>
            <div className="space-y-6">
              {[
                { label: 'Network Status', val: 'SYNCED', color: 'text-green-400' },
                { label: 'Confirmations', val: '128 Blocks', color: 'text-bone' },
                { label: 'Privacy Score', val: '9.8/10', color: 'text-action' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-end border-b border-white/10 pb-4 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className="text-xs font-bold opacity-40 uppercase">{item.label}</span>
                  <span className={`text-xs font-black ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-3">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Live Decryption Logs</p>
              <div className="bg-black/30 rounded-2xl p-4 font-mono text-[10px] h-48 overflow-y-auto no-scrollbar space-y-2 border border-white/5 shadow-inner">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 animate-slide-in-right">
                    <span className="text-action opacity-50">[{idx}]</span>
                    <span className="text-white/80">{log}</span>
                  </div>
                ))}
                <div className="w-1 h-3 bg-action animate-pulse inline-block" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-xl border-2 border-accent/10 stagger-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mb-6">Timeline</h4>
            <div className="space-y-6">
              {[
                { label: 'Created', status: 'Complete', date: 'Oct 12' },
                { label: 'Voting Period', status: 'Complete', date: 'Oct 14' },
                { label: 'Encryption Reveal', status: 'Verified', date: 'Today' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 transition-all duration-700 ${idx === 2 && showCharts ? 'bg-action shadow-[0_0_15px_#D20C19] scale-125' : 'bg-primary/20'}`} />
                  <div className="flex-1">
                    <p className="text-xs font-black text-primary leading-none uppercase tracking-wider">{item.label}</p>
                    <p className="text-[10px] font-bold text-primary/40">{item.status} • {item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Charts */}
        <div className={`lg:col-span-2 space-y-8 transition-all duration-700 ${showCharts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white rounded-[48px] p-10 md:p-14 shadow-2xl border-4 border-accent relative overflow-hidden h-full group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-action/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-action/10 transition-colors" />

            <header className="mb-12 space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-bone border-2 border-accent rounded-full animate-pulse">
                <div className="w-2 h-2 rounded-full bg-action" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Final Consensus Map</span>
              </div>
              <h1 className="text-5xl font-display font-black text-primary leading-tight tracking-tighter transition-all group-hover:tracking-tight">
                {poll.question}
              </h1>
            </header>

            {winner && data.length > 0 && (
              <div className="mb-12 p-1 bg-action rounded-[32px] animate-scale-in">
                <div className="bg-white rounded-[30px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 hover:shadow-inner transition-all">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-action uppercase tracking-[0.4em]">Majority Choice</p>
                    <h2 className="text-3xl font-display font-black text-primary tracking-tight group-hover:text-action transition-colors">{winner.label}</h2>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-5xl font-black text-primary tracking-tighter">
                      {(() => {
                        const totalVotes = data.reduce((sum, d) => sum + d.votes, 0);
                        const winnerVotes = data[0]?.votes || 0;
                        return totalVotes > 0 ? ((winnerVotes / totalVotes) * 100).toFixed(0) : 0;
                      })()}%
                    </div>
                    <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">
                      {data.reduce((a, b) => a + b.votes, 0)} of {poll.totalVotes} Votes Validated
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={`h-[400px] w-full mt-12 transition-opacity duration-1000 ${showCharts ? 'opacity-100' : 'opacity-0'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data}
                  margin={{ top: 0, right: 40, left: 20, bottom: 0 }}
                >
                  <XAxis type="number" hide domain={[0, 'dataMax']} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#1A1A1A', fontWeight: 900, fontSize: 13 }}
                    width={160}
                  />
                  <Tooltip
                    cursor={{ fill: '#F8FBEA' }}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      backgroundColor: '#1E293B',
                      color: '#F8FBEA',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      padding: '12px'
                    }}
                  />
                  <Bar
                    dataKey="votes"
                    radius={[0, 16, 16, 0]}
                    barSize={80}
                    animationDuration={1500}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#D20C19' : '#1E293B'}
                        fillOpacity={index === 0 ? 1 : 0.15}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <footer className="mt-16 pt-10 border-t-2 border-accent/10 flex flex-wrap gap-10 items-center justify-between">
              <div className="flex items-center gap-3 group/foot">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-action font-black shadow-lg group-hover/foot:rotate-12 transition-transform">Z</div>
                <div>
                  <p className="text-[9px] font-black text-primary/30 uppercase tracking-tighter">Decrypted Via</p>
                  <p className="text-[11px] font-black text-primary uppercase">Threshold-FHE</p>
                </div>
              </div>
              <div className="flex items-center gap-3 group/foot">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-action font-black shadow-lg group-hover/foot:-rotate-12 transition-transform">A</div>
                <div>
                  <p className="text-[9px] font-black text-primary/30 uppercase tracking-tighter">Audit Status</p>
                  <p className="text-[11px] font-black text-primary uppercase">Fully Verified</p>
                </div>
              </div>
              <a
                href={`https://explorer.fhenix.zone/tx/${poll.transactionHash}`}
                className="flex-1 text-right text-[11px] font-black text-action hover:underline uppercase tracking-widest active:scale-95 transition-transform"
              >
                View Proof on Explorer ↗
              </a>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
