
export enum PollStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  REVEALED = 'REVEALED'
}

export interface PollOption {
  id: string;
  label: string;
  voteCount?: number; // Only available after reveal
}

export interface Poll {
  id: string;
  question: string;
  description: string;
  category: string;
  status: PollStatus;
  endsAt: string;
  totalVotes: number;
  options: PollOption[];
  creator: string;
  isActive: boolean;
  transactionHash?: string;
  imageUrl?: string; // Optional poll image URL
}

export interface EncryptionState {
  isEncrypting: boolean;
  progress: number;
  message: string;
  // CoFHE states: Extract, Pack, Prove, Verify, Replace, Done
  cofheState?: string;
}
