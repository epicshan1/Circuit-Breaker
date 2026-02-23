
import React from 'react';
import { Protocol } from '../types';

interface ProtocolCardProps {
  protocol: Protocol;
  onClick: () => void;
  isFavorite: boolean;
  onFavoriteToggle: (e: React.MouseEvent) => void;
}

const ProtocolCard: React.FC<ProtocolCardProps> = ({ protocol, onClick, isFavorite, onFavoriteToggle }) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-800 hover:-translate-y-1"
    >
      <button
        onClick={onFavoriteToggle}
        className={`absolute top-4 right-4 text-xl transition-transform hover:scale-125 ${
          isFavorite ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'
        }`}
      >
        <i className={`fa-star ${isFavorite ? 'fas' : 'far'}`}></i>
      </button>

      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">
        {protocol.icon}
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{protocol.title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
        {protocol.description}
      </p>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
          <i className="far fa-clock"></i>
          {protocol.duration}s
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
          <i className="fas fa-list-check"></i>
          {protocol.steps.length} steps
        </div>
      </div>
    </div>
  );
};

export default ProtocolCard;
