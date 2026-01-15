import React from 'react';
import { useAccount } from 'wagmi';
import { Poll, PollStatus } from '../types';
import { ShieldIcon } from '../constants';

interface ProfileProps {
    polls: Poll[];
    onViewPoll: (id: string) => void;
    onBack: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ polls, onViewPoll, onBack }) => {
    const { address, isConnected } = useAccount();

    if (!isConnected || !address) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <ShieldIcon className="w-16 h-16 mx-auto mb-6 text-action opacity-50" />
                <h2 className="text-3xl font-display font-black text-primary mb-4">Connect Your Wallet</h2>
                <p className="text-primary/60">Connect your wallet to view your voting history and achievements</p>
            </div>
        );
    }

    // Filter polls by user interaction
    const createdPolls = polls.filter(p => p.creator.toLowerCase() === address.toLowerCase());
    const participatedPolls = polls.filter(p => {
        // Note: We'll need to check hasVoted from contract for accurate data
        // For now, showing all polls (will update with contract check)
        return p.totalVotes > 0;
    });

    const stats = [
        { label: 'Polls Created', value: createdPolls.length, icon: '📝', color: 'bg-blue-500' },
        { label: 'Polls Participated', value: participatedPolls.length, icon: '🗳️', color: 'bg-green-500' },
        { label: 'Active Votes', value: participatedPolls.filter(p => p.status === PollStatus.ACTIVE).length, icon: '⚡', color: 'bg-yellow-500' },
        { label: 'Total Votes Cast', value: participatedPolls.length, icon: '✓', color: 'bg-action' }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="text-primary font-black uppercase tracking-widest text-xs hover:text-action flex items-center gap-3 transition-colors group">
                    <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Back
                </button>
            </div>

            {/* Profile Header */}
            <div className="bg-gradient-to-r from-primary to-accent rounded-[48px] p-12 text-bone">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-action rounded-full flex items-center justify-center text-4xl font-black shadow-2xl">
                        {address.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-black mb-2">Your Profile</h1>
                        <p className="text-bone/60 font-mono text-sm">{address.slice(0, 6)}...{address.slice(-4)}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 border-2 border-accent/10 hover:border-action transition-all group">
                        <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <p className="text-3xl font-black text-primary mb-1">{stat.value}</p>
                        <p className="text-xs uppercase tracking-wider text-primary/40 font-bold">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Created Polls Section */}
            {createdPolls.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-display font-black text-primary flex items-center gap-3">
                        <span className="text-3xl">📝</span> Your Created Polls
                    </h2>
                    <div className="grid gap-4">
                        {createdPolls.map(poll => (
                            <button
                                key={poll.id}
                                onClick={() => onViewPoll(poll.id)}
                                className="bg-white rounded-3xl p-6 border-2 border-accent/10 hover:border-action transition-all text-left group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${poll.status === PollStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                                                    poll.status === PollStatus.REVEALED ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {poll.status}
                                            </span>
                                            <span className="text-xs text-primary/40 uppercase tracking-wider">{poll.category}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-primary group-hover:text-action transition-colors mb-2">
                                            {poll.question}
                                        </h3>
                                        <p className="text-sm text-primary/60">{poll.totalVotes} votes • {poll.options.length} options</p>
                                    </div>
                                    <span className="text-action text-xl group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Participated Polls Section */}
            {participatedPolls.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-display font-black text-primary flex items-center gap-3">
                        <span className="text-3xl">🗳️</span> Recent Activity
                    </h2>
                    <div className="grid gap-4">
                        {participatedPolls.slice(0, 5).map(poll => (
                            <button
                                key={poll.id}
                                onClick={() => onViewPoll(poll.id)}
                                className="bg-white rounded-3xl p-6 border-2 border-accent/10 hover:border-action transition-all text-left group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${poll.status === PollStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                                                    poll.status === PollStatus.REVEALED ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {poll.status}
                                            </span>
                                            <span className="text-xs text-primary/40 uppercase tracking-wider">{poll.category}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-primary group-hover:text-action transition-colors mb-2">
                                            {poll.question}
                                        </h3>
                                        <p className="text-sm text-primary/60">{poll.totalVotes} votes</p>
                                    </div>
                                    <span className="text-action text-xl group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {createdPolls.length === 0 && participatedPolls.length === 0 && (
                <div className="bg-bone rounded-3xl p-12 text-center border-2 border-accent/10">
                    <p className="text-2xl mb-2">🌟</p>
                    <h3 className="text-xl font-black text-primary mb-2">No Activity Yet</h3>
                    <p className="text-primary/60">Create your first poll or participate in existing ones to see them here!</p>
                </div>
            )}
        </div>
    );
};
