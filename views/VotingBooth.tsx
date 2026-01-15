
import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { Poll, EncryptionState } from '../types';
import { ShieldIcon, LoadingSpinner } from '../constants';
import { encryptVoteForSubmission } from '../services/fheService';
import { submitVoteToContract, checkHasVoted } from '../services/contractService';
import { initializeNewCofhe } from '../services/newCofhe';
import { PrivacyIndicator } from '../components/PrivacyIndicator';

interface VotingBoothProps {
  poll: Poll;
  onBack: () => void;
  onVoteSuccess: (pollId: string, txHash: string) => void;
}

export const VotingBooth: React.FC<VotingBoothProps> = ({ poll, onBack, onVoteSuccess }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [encryptionState, setEncryptionState] = useState<EncryptionState>({
    isEncrypting: false,
    progress: 0,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isCheckingVote, setIsCheckingVote] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [cofheInitialized, setCofheInitialized] = useState(false);
  const [cofheInitializing, setCofheInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState(0);

  // Check if user has already voted
  useEffect(() => {
    const checkVoteStatus = async () => {
      if (isConnected && address && walletClient) {
        setIsCheckingVote(true);
        try {
          const provider = new BrowserProvider(walletClient as any);
          const voted = await checkHasVoted(parseInt(poll.id), address, provider);
          setHasVoted(voted);
        } catch (error) {
          console.error('Error checking vote status:', error);
        } finally {
          setIsCheckingVote(false);
        }
      }
    };

    checkVoteStatus();
  }, [isConnected, address, walletClient, poll.id]);

  // Initialize CoFHE only when voting (lazy initialization)
  const ensureCofheInitialized = async () => {
    if (cofheInitialized) return true;
    if (cofheInitializing) return false;

    setCofheInitializing(true);
    setInitProgress(10);

    try {
      setInitProgress(30);
      const provider = new BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();

      setInitProgress(50);
      const result = await initializeNewCofhe(provider, signer);

      setInitProgress(90);

      if (!result.success) {
        setInitError(result.error instanceof Error ? result.error.message : 'Failed to initialize FHE encryption');
        return false;
      } else {
        setInitProgress(100);
        setCofheInitialized(true);
        return true;
      }
    } catch (error) {
      console.error('CoFHE initialization error:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error');
      return false;
    } finally {
      setCofheInitializing(false);
    }
  };

  const handleVote = async () => {
    if (!selectedId) return;
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    // Initialize CoFHE only when user actually votes
    if (!cofheInitialized) {
      const initialized = await ensureCofheInitialized();
      if (!initialized) {
        alert('Failed to initialize encryption. Please try again.');
        return;
      }
    }

    try {
      // CRITICAL FIX: Always encrypt '1' to add to the option counter.
      // Previously was encrypting selectedId (e.g. 0), which added 0 to the count.
      const voteValue = BigInt(1);

      const encryptedData = await encryptVoteForSubmission(voteValue, (state) => setEncryptionState(state));

      setIsSubmitting(true);

      // Submit to smart contract
      const provider = new BrowserProvider(walletClient as any);
      const pollId = parseInt(poll.id);
      const optionId = parseInt(selectedId);

      const result = await submitVoteToContract(pollId, optionId, encryptedData, provider);

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      onVoteSuccess(poll.id, result.txHash!);
    } catch (error) {
      console.error(error);
      alert(`Failed to submit vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEncryptionState({ isEncrypting: false, progress: 0, message: '' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <PrivacyIndicator state={encryptionState} />

      <button onClick={onBack} className="text-primary/60 hover:text-primary flex items-center gap-2 font-bold text-sm transition-colors group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
      </button>

      {!isConnected && (
        <div className="bg-action/10 border-2 border-action rounded-2xl p-6 flex items-center gap-4">
          <ShieldIcon className="w-6 h-6 text-action" />
          <div>
            <p className="font-black text-action uppercase tracking-wider text-sm">Wallet Required</p>
            <p className="text-sm text-primary/60 mt-1">Please connect your wallet to cast an encrypted vote</p>
          </div>
        </div>
      )}

      {initError && (
        <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-6">
          <p className="font-black text-red-500 uppercase tracking-wider text-sm">Initialization Error</p>
          <p className="text-sm text-primary/60 mt-1">{initError}</p>
        </div>
      )}

      {/* CoFHE Initialization Status */}
      {isConnected && cofheInitializing && !initError && (
        <div className="bg-blue-500/10 border-2 border-blue-500 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <ShieldIcon className="w-6 h-6 text-blue-500" />
              <div className="absolute inset-0 animate-ping">
                <ShieldIcon className="w-6 h-6 text-blue-500 opacity-30" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-black text-blue-500 uppercase tracking-wider text-sm">Initializing FHE Encryption</p>
              <p className="text-sm text-primary/60 mt-1">Setting up secure cryptographic environment...</p>
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${initProgress}%` }}
            />
          </div>
          <p className="text-xs text-blue-500 font-mono">
            {initProgress < 30 ? 'Connecting to network...' :
              initProgress < 50 ? 'Getting signer...' :
                initProgress < 90 ? 'Initializing CoFHE SDK...' :
                  'Finalizing...'}
          </p>
        </div>
      )}

      {/* Ready to Vote Status (before initialization) */}
      {isConnected && !cofheInitialized && !cofheInitializing && !hasVoted && !initError && (
        <div className="bg-green-500/10 border-2 border-green-500 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2 bg-green-500 rounded-full">
            <ShieldIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-black text-green-600 uppercase tracking-wider text-xs">Ready to Vote</p>
            <p className="text-xs text-primary/60">Encryption will initialize when you cast your vote</p>
          </div>
        </div>
      )}

      {/* CoFHE Ready Status (after initialization) */}
      {isConnected && cofheInitialized && !hasVoted && (
        <div className="bg-green-500/10 border-2 border-green-500 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2 bg-green-500 rounded-full">
            <ShieldIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-black text-green-600 uppercase tracking-wider text-xs">FHE Ready</p>
            <p className="text-xs text-primary/60">Secure encryption enabled - your vote will be private</p>
          </div>
        </div>
      )}

      {/* Already Voted Status */}
      {isConnected && hasVoted && (
        <div className="bg-action/10 border-2 border-action rounded-2xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-action/20 rounded-full">
              <ShieldIcon className="w-8 h-8 text-action" />
            </div>
            <div>
              <p className="font-black text-action uppercase tracking-widest text-base">Governance Recorded</p>
              <p className="text-sm text-primary/70 mt-1 font-medium">Your encrypted contribution has been safely merged into the threshold.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-action/10 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-action/60">
            <span>One Wallet • One Vote</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-action rounded-full animate-pulse" />
              Verified By Fhenix
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl border-4 border-accent/5 space-y-8 group transition-all duration-500 hover:border-accent/10">
        <header className="space-y-4 border-b border-primary/5 pb-8">
          <div className="flex items-center gap-2">
            <span className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
              {poll.category}
            </span>
            <div className="flex items-center gap-1.5 text-action bg-action/5 px-3 py-1 rounded-full">
              <ShieldIcon className="w-3 h-3 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest">FHE Protected</span>
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-primary leading-tight transition-all group-hover:tracking-tight">
            {poll.question}
          </h1>
          <p className="text-primary/60 leading-relaxed opacity-80">
            {poll.description}
          </p>
        </header>

        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-2">Select your option</p>
          {poll.options.map((option, idx) => (
            <label
              key={option.id}
              className={`
                flex items-center justify-between p-6 rounded-2xl border-2 transition-all stagger-${idx + 1}
                ${selectedId === option.id
                  ? 'border-action bg-action/5 shadow-[inset_0_2px_10px_rgba(210,12,25,0.05)] scale-[1.02]'
                  : 'border-primary/5 bg-bone/30 hover:bg-bone hover:border-accent/20'}
                ${hasVoted ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer animate-fade-in-up'}
              `}
            >
              <span className={`text-lg font-bold transition-colors ${selectedId === option.id ? 'text-action' : 'text-primary'}`}>
                {option.label}
              </span>
              <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${selectedId === option.id ? 'border-action bg-action' : 'border-primary/10 bg-white'}`}>
                {selectedId === option.id && <div className="w-2 h-2 rounded-full bg-white animate-scale-in" />}
              </div>
              <input
                type="radio"
                name="poll-option"
                className="hidden"
                disabled={hasVoted}
                checked={selectedId === option.id}
                onChange={() => setSelectedId(option.id)}
              />
            </label>
          ))}
        </div>

        <div className="pt-4 space-y-4">
          <button
            disabled={!selectedId || !isConnected || encryptionState.isEncrypting || isSubmitting || hasVoted}
            onClick={handleVote}
            className={`
              w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 overflow-hidden relative group/btn
              ${selectedId && isConnected && !isSubmitting && !hasVoted
                ? 'bg-action text-white hover:bg-primary active:scale-[0.98] shadow-action/20'
                : 'bg-primary/5 text-primary/20 cursor-not-allowed border-2 border-primary/5'}
            `}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner className="w-5 h-5" />
                Dispatching Tx...
              </>
            ) : hasVoted ? (
              <>
                <ShieldIcon className="w-5 h-5 opacity-40" />
                <span>Vote Record Sealed</span>
              </>
            ) : (
              <>
                <ShieldIcon className={`w-5 h-5 ${selectedId ? 'animate-bounce' : ''}`} />
                <span>Cast Encrypted Vote</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-primary/40 uppercase font-bold tracking-widest transition-opacity group-hover:opacity-100 opacity-60">
            Secure locally before transmission • FHE Unsealing V0.1
          </p>
        </div>
      </div>
    </div>
  );
};
