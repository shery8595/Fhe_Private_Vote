import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Poll, PollStatus } from './types';
import { Dashboard } from './views/Dashboard';
import { CreationSuite } from './views/CreationSuite';
import { VotingBooth } from './views/VotingBooth';
import { ResultsCenter } from './views/ResultsCenter';
import { LandingPage } from './views/LandingPage';
import { Whitepaper } from './views/Whitepaper';
import { Manifesto } from './views/Manifesto';
import { Technology } from './views/Technology';
import { DebugFHE } from './views/DebugFHE';
import { Profile } from './views/Profile';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { getPollCount, getPollFromContract } from './services/contractService';

const INITIAL_POLLS: Poll[] = [];

type AppView = 'landing' | 'dashboard' | 'create' | 'vote' | 'results' | 'whitepaper' | 'manifesto' | 'technology' | 'debug' | 'profile';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [polls, setPolls] = useState<Poll[]>(INITIAL_POLLS);
  const [activePollId, setActivePollId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const fetchPolls = async () => {
    setIsLoading(true);
    try {
      // Use wallet provider if available, otherwise use public RPC
      let provider;
      if (walletClient) {
        provider = new BrowserProvider(walletClient as any);
      } else {
        // Public Arbitrum Sepolia RPC endpoint
        const { JsonRpcProvider } = await import('ethers');
        provider = new JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc');
      }

      const count = await getPollCount(provider);

      const fetchedPolls: Poll[] = [];
      for (let i = 0; i < count; i++) {
        const pollData = await getPollFromContract(i, provider);
        if (pollData) {
          // Determine poll status based on time and reveal state
          const endsAtDate = new Date(pollData.endsAt);
          const now = new Date();
          const isTimeExpired = now > endsAtDate;

          let status: PollStatus;
          if (pollData.resultsRevealed) {
            status = PollStatus.REVEALED;
          } else if (isTimeExpired || !pollData.isActive) {
            status = PollStatus.CLOSED;
          } else {
            status = PollStatus.ACTIVE;
          }

          fetchedPolls.push({
            id: i.toString(),
            question: pollData.question,
            description: pollData.description,
            category: pollData.category,
            status,
            endsAt: pollData.endsAt,
            totalVotes: pollData.totalVotes,
            creator: pollData.creator,
            isActive: pollData.isActive,
            options: Array.from({ length: pollData.optionCount }, (_, idx) => ({
              id: idx.toString(),
              label: pollData.optionLabels[idx] || `Option ${idx + 1}`
            }))
          });
        }
      }
      setPolls(fetchedPolls.reverse()); // Newest first
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    // Fetch polls on mount and when wallet connects
    fetchPolls();
  }, [isConnected, walletClient]);

  const activePoll = polls.find(p => p.id === activePollId);

  const switchView = (newView: AppView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setIsTransitioning(false);
    }, 50);
  };

  const handleViewPoll = (id: string) => {
    const poll = polls.find(p => id === p.id);
    if (!poll) return;
    setActivePollId(id);
    // Show results for CLOSED or REVEALED polls, voting only for ACTIVE
    if (poll.status === PollStatus.REVEALED || poll.status === PollStatus.CLOSED) {
      switchView('results');
    } else {
      switchView('vote');
    }
  };

  const handleVoteSuccess = (pollId: string, txHash: string) => {
    fetchPolls(); // Refresh from chain
    switchView('dashboard');
  };

  const handlePollCreated = (newPoll: Poll) => {
    fetchPolls(); // Refresh from chain
    switchView('dashboard');
  };

  const isNavVisible = view !== 'landing';

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-action/20">
      {isNavVisible && (
        <nav className="sticky top-0 z-40 bg-primary text-bone border-b border-white/10 px-6 py-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => switchView('dashboard')}>
            <div className="bg-action p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-[0_0_15px_rgba(210,12,25,0.4)]">
              <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L3 19h18L12 2zM12 16a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </div>
            <span className="text-2xl font-display font-black tracking-tight uppercase">
              SecureVote <span className="text-action animate-pulse">FHE</span>
            </span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
              <button onClick={() => switchView('profile')} className="hover:text-action transition-all">Profile</button>
              <button onClick={() => switchView('technology')} className="hover:text-action transition-all">Technology</button>
              <button onClick={() => switchView('manifesto')} className="hover:text-action transition-all">Manifesto</button>
              <button onClick={() => switchView('whitepaper')} className="hover:text-action transition-all">Whitepaper</button>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 border border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-action animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Fhenix Arbitrum Sepolia</span>
            </div>
            <ConnectButton showBalance={false} chainStatus="icon" />
            <button onClick={() => switchView('debug')} className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 hover:text-white transition-all border border-yellow-500/50 px-3 py-1 rounded">DEBUG</button>
          </div>
        </nav>
      )}

      <main className={`flex-1 ${view !== 'landing' ? 'container mx-auto px-6 py-12' : ''} ${isTransitioning ? 'opacity-0 scale-95' : 'view-transition opacity-100 scale-100'} transition-all duration-300`}>
        {view === 'landing' && (
          <LandingPage
            onEnter={() => switchView('dashboard')}
            onViewWhitepaper={() => switchView('whitepaper')}
            onViewManifesto={() => switchView('manifesto')}
            onViewTechnology={() => switchView('technology')}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard
            polls={polls}
            onViewPoll={handleViewPoll}
            onCreate={() => switchView('create')}
          />
        )}

        {view === 'create' && (
          <CreationSuite
            onBack={() => switchView('dashboard')}
            onCreated={handlePollCreated}
          />
        )}

        {view === 'vote' && activePoll && (
          <VotingBooth
            poll={activePoll}
            onBack={() => switchView('dashboard')}
            onVoteSuccess={handleVoteSuccess}
          />
        )}

        {view === 'results' && activePoll && (
          <ResultsCenter
            poll={activePoll}
            onBack={() => switchView('dashboard')}
            onRefresh={fetchPolls}
          />
        )}

        {view === 'whitepaper' && <Whitepaper onBack={() => switchView('landing')} />}
        {view === 'manifesto' && <Manifesto onBack={() => switchView('landing')} />}
        {view === 'technology' && <Technology onBack={() => switchView('landing')} />}
        {view === 'debug' && <DebugFHE onBack={() => switchView('dashboard')} />}
        {view === 'profile' && <Profile polls={polls} onViewPoll={handleViewPoll} onBack={() => switchView('dashboard')} />}
      </main>

      {view !== 'landing' && (
        <footer className="bg-primary text-bone border-t border-white/10 py-16 px-6">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-4 text-center md:text-left">
              <p className="text-xs font-black text-action uppercase tracking-[0.3em] animate-pulse">Privacy-First Governance</p>
              <div className="flex gap-6 items-center justify-center md:justify-start">
                <span className="text-2xl font-black tracking-tighter hover:text-action transition-colors cursor-default">FHENIX</span>
                <div className="h-4 w-[1px] bg-white/20" />
                <span className="text-2xl font-black tracking-tighter hover:text-action transition-colors cursor-default">ARBITRUM</span>
              </div>
            </div>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
              <button onClick={() => switchView('whitepaper')} className="hover:text-action hover:opacity-100 transition-all">Docs</button>
              <a href="#" className="hover:text-action hover:opacity-100 transition-all">Privacy</a>
              <a href="#" className="hover:text-action hover:opacity-100 transition-all">GitHub</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
