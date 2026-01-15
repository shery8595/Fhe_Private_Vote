import React, { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { cofhejs, Encryptable } from 'cofhejs/web';
import { initializeNewCofhe, encryptVoteNew } from '../services/newCofhe';

export const DebugFHE = ({ onBack }: { onBack: () => void }) => {
    const { isConnected, address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<string>('Ready');

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const testOldImpl = async () => {
        if (!walletClient) return addLog('❌ Wallet not connected');

        try {
            setStatus('Testing Old Implementation...');
            addLog('🚀 Starting Old Impl Test (cofhejs)');

            const provider = new BrowserProvider(walletClient as any);
            const signer = await provider.getSigner();

            addLog('Initializing cofhejs...');
            await cofhejs.initializeWithEthers({
                ethersProvider: provider,
                ethersSigner: signer,
                environment: 'TESTNET',
            });
            addLog('✅ cofhejs Initialized');

            addLog('Encrypting value 1n...');
            // Simulating the old encryptVote function
            const encrypted = await cofhejs.encrypt(
                [Encryptable.uint64(1n)],
                (state) => addLog(`Encryption State: ${state}`)
            );

            if (encrypted.success) {
                addLog('✅ Encryption SUCCESS');
                const result = encrypted.data[0];
                addLog(`Type of result: ${typeof result}`);
                addLog(`Value: ${result}`);

                if (typeof result === 'string') {
                    addLog('⚠️ RESULT IS A STRING (Old Behavior). Contracts expecting objects (InEuint64) implies this string might be causing the substring error if treated as an object internally elsewhere or if the contract call expects a tuple/struct.');
                }
            } else {
                addLog(`❌ Encryption FAILED: ${encrypted.error}`);
            }

        } catch (e: any) {
            addLog(`❌ EXCEPTION: ${e.message}`);
            console.error(e);
        } finally {
            setStatus('Ready');
        }
    };

    const testNewImpl = async () => {
        if (!walletClient) return addLog('❌ Wallet not connected');

        try {
            setStatus('Testing New Implementation...');
            addLog('🚀 Starting New Impl Test (FHE.encrypt_uint64)');

            const provider = new BrowserProvider(walletClient as any);
            const signer = await provider.getSigner();

            addLog('Initializing new CoFHE...');
            const initRes = await initializeNewCofhe(provider, signer);
            if (!initRes.success) throw initRes.error;
            addLog('✅ New CoFHE Initialized');

            addLog('Encrypting value 1n...');
            const encRes = await encryptVoteNew(1n);
            if (!encRes.success) throw encRes.error;

            addLog('✅ Encryption SUCCESS');
            const result = encRes.encrypted;
            addLog(`Type of result: ${typeof result}`);

            // Safe logging for BigInt
            const safeLog = JSON.stringify(result, (key, value) =>
                typeof value === 'bigint' ? value.toString() + 'n' : value
                , 2);
            addLog(`Value: ${safeLog}`);

            if (typeof result === 'object' && result !== null) {
                addLog('✅ RESULT IS AN OBJECT (New Behavior). Matches InEuint64 contract expectation.');
            } else {
                addLog('⚠️ RESULT IS NOT AN OBJECT?');
            }

        } catch (e: any) {
            addLog(`❌ EXCEPTION: ${e.message}`);
            console.error(e);
        } finally {
            setStatus('Ready');
        }
    };

    return (
        <div className="bg-primary/95 text-bone p-8 rounded-xl border border-white/10 max-w-4xl mx-auto backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-display font-black uppercase tracking-tight">FHE Debugger</h2>
                <button onClick={onBack} className="text-sm font-bold uppercase tracking-widest hover:text-action transition-colors">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h3 className="font-bold mb-2 text-action/80">Status: {isConnected ? 'Connected' : 'Disconnected'}</h3>
                        <p className="text-sm opacity-60 break-all">{address}</p>
                    </div>

                    <button
                        onClick={testOldImpl}
                        disabled={!isConnected || status !== 'Ready'}
                        className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-bone py-4 rounded-lg font-black uppercase tracking-widest transition-all"
                    >
                        Test Old Implementation
                    </button>

                    <button
                        onClick={testNewImpl}
                        className="w-full bg-action/20 hover:bg-action/30 text-action py-4 rounded-lg font-black uppercase tracking-widest transition-all border border-action/20"
                    >
                        Test New Implementation (Simulation)
                    </button>
                </div>

                <div className="bg-black/40 rounded-lg p-4 font-mono text-xs h-[400px] overflow-y-auto border border-white/5 shadow-inner">
                    {logs.length === 0 ? <span className="opacity-30">Logs will appear here...</span> : logs.map((log, i) => (
                        <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};
