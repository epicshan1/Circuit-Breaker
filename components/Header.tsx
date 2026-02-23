
import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, darkMode, setDarkMode }) => {
  const tabs = [
    { id: 'protocols', icon: 'fa-heart-pulse', label: 'Protocols' },
    { id: 'insights', icon: 'fa-chart-line', label: 'Insights' },
    { id: 'journal', icon: 'fa-book-open', label: 'Journal' },
    { id: 'chat', icon: 'fa-comment-dots', label: 'Guide' },
    { id: 'edu', icon: 'fa-graduation-cap', label: 'Learn' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full mb-8">
      <div className={`glass px-4 py-3 flex flex-col md:flex-row items-center justify-between shadow-sm transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <i className="fas fa-brain"></i>
          </div>
          <div>
            <h1 className={`font-extrabold text-xl tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Circuit Breaker</h1>
            <p className="text-xs text-indigo-500 font-semibold uppercase tracking-widest">Nervous System Pro</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-indigo-500'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
