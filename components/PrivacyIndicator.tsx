
import React from 'react';
import { ShieldIcon } from '../constants';
import { EncryptionState } from '../types';

interface PrivacyIndicatorProps {
  state: EncryptionState;
}

export const PrivacyIndicator: React.FC<PrivacyIndicatorProps> = ({ state }) => {
  if (!state.isEncrypting) return null;

  return (
    <div className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bone rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 bg-action/10 rounded-full pulse-shield">
            <ShieldIcon className="w-16 h-16 text-action" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-bold text-primary">Sealing Your Vote</h3>
          <p className="text-primary/70 leading-relaxed">
            Your choice is being encrypted using Fully Homomorphic Encryption (FHE) on your device.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-full bg-primary/10 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-action h-full transition-all duration-500 ease-out" 
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <p className="text-xs font-mono text-action font-semibold tracking-wider uppercase">
            {state.message}
          </p>
        </div>

        <p className="text-[10px] text-primary/40 uppercase tracking-widest font-bold pt-4 border-t border-primary/10">
          End-to-End Privacy Guaranteed • Fhenix Network
        </p>
      </div>
    </div>
  );
};
