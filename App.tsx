
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProtocolCard from './components/ProtocolCard';
import ProtocolTimer from './components/ProtocolTimer';
import AIChat from './components/AIChat';
import VoiceJournal from './components/VoiceJournal';
import { PROTOCOLS } from './constants';
import { Protocol, JournalEntry, AppState } from './types';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('protocols');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [appState, setAppState] = useState<AppState>({
    usage: {},
    journal: [],
    favorites: [],
    profile: { name: '', email: '', bio: '' },
    emergencyContact: { name: '', phone: '', email: '', message: 'I am feeling overwhelmed and need support. Please check in on me.' },
    preferences: { notifications: true, haptics: true, audioVolume: 80, audioEnabled: true }
  });
  const [journalText, setJournalText] = useState('');
  const [deepReflection, setDeepReflection] = useState<string | null>(null);
  const [isReflecting, setIsReflecting] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const gemini = GeminiService.getInstance();

  useEffect(() => {
    const saved = localStorage.getItem('circuit_breaker_data');
    if (saved) setAppState(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('circuit_breaker_data', JSON.stringify(appState));
  }, [appState]);

  const handleProtocolComplete = () => {
    if (selectedProtocol) {
      setAppState(prev => ({
        ...prev,
        usage: {
          ...prev.usage,
          [selectedProtocol.id]: (prev.usage[selectedProtocol.id] || 0) + 1
        }
      }));
    }
  };

  const saveJournalEntry = (text: string = journalText) => {
    if (!text.trim()) return;
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      protocol: selectedProtocol?.title || 'General Reflection',
      text
    };
    setAppState(prev => ({ ...prev, journal: [newEntry, ...prev.journal] }));
    setJournalText('');
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
  };

  const getAIPatternAnalysis = async () => {
    if (appState.journal.length < 2) return;
    setIsReflecting(true);
    try {
      const analysis = await gemini.getDeepReflection(appState.journal.slice(0, 5));
      setDeepReflection(analysis || "Not enough data for patterns yet.");
    } catch (err) {
      setDeepReflection("Analysis error. Keep practicing.");
    } finally {
      setIsReflecting(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setAppState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(id) 
        ? prev.favorites.filter(f => f !== id) 
        : [...prev.favorites, id]
    }));
  };

  const handleEmergencyTrigger = () => {
    if (!appState.emergencyContact) return;
    const { phone, email, message } = appState.emergencyContact;
    
    if (phone) {
      window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
    } else if (email) {
      window.location.href = `mailto:${email}?subject=Emergency Support Needed&body=${encodeURIComponent(message)}`;
    } else {
      alert("No contact info saved. Please add an emergency contact in Settings.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('circuit_breaker_data');
    window.location.reload();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="animate-in fade-in duration-700">
          {activeTab === 'protocols' && (
            <div className="space-y-8">
              {selectedProtocol ? (
                <div className="space-y-6">
                  <button onClick={() => setSelectedProtocol(null)} className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
                    <i className="fas fa-arrow-left"></i> Back to All Protocols
                  </button>
                  <ProtocolTimer 
                    protocol={selectedProtocol} 
                    onComplete={handleProtocolComplete} 
                    preferences={appState.preferences}
                  />
                  
                  {/* Post-Protocol Reflection */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <h4 className="font-bold text-lg">Reflection: How do you feel now?</h4>
                      <VoiceJournal onTranscription={(text) => setJournalText(prev => prev + " " + text)} />
                    </div>
                    <textarea
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      placeholder="Type or use the voice journal to record your reflection..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 text-slate-900 dark:text-white"
                    />
                    <div className="flex items-center gap-4">
                      <button onClick={() => saveJournalEntry()} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-indigo-700 transition-colors">
                        Save to Journal
                      </button>
                      {saveFeedback && (
                        <span className="text-emerald-500 font-bold text-sm animate-in fade-in slide-in-from-left-2">
                          <i className="fas fa-check-circle mr-1"></i> Saved!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PROTOCOLS.map(p => (
                    <ProtocolCard 
                      key={p.id} 
                      protocol={p} 
                      onClick={() => setSelectedProtocol(p)} 
                      isFavorite={appState.favorites.includes(p.id)}
                      onFavoriteToggle={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total Sessions</p>
                  <h3 className="text-4xl font-black text-indigo-600">
                    {(Object.values(appState.usage) as number[]).reduce((a, b) => a + b, 0)}
                  </h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Journal Entries</p>
                  <h3 className="text-4xl font-black text-emerald-500">{appState.journal.length}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Favorite Protocols</p>
                  <h3 className="text-4xl font-black text-amber-500">{appState.favorites.length}</h3>
                </div>
              </div>

              {appState.journal.length === 0 && (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <i className="fas fa-chart-pie text-4xl text-slate-200 mb-4"></i>
                  <h4 className="text-xl font-bold mb-2">Start logging to see your patterns</h4>
                  <p className="text-slate-500">Complete protocols and write in your journal to unlock AI-powered nervous system insights.</p>
                </div>
              )}

              {appState.journal.length > 0 && (
                <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">Deep Reflection Patterns</h3>
                    <p className="text-indigo-100 text-sm mb-6 leading-relaxed max-w-2xl">
                      Our AI can analyze your journal history to find hidden nervous system triggers and provide custom somatic advice.
                    </p>
                    {deepReflection ? (
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 whitespace-pre-wrap leading-relaxed animate-in fade-in zoom-in-95 duration-500">
                        {deepReflection}
                      </div>
                    ) : (
                      <button
                          onClick={getAIPatternAnalysis}
                          disabled={isReflecting || appState.journal.length < 2}
                          className="bg-white text-indigo-600 font-black py-3 px-8 rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                      >
                        {isReflecting ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sparkles mr-2"></i>}
                        {isReflecting ? 'Thinking...' : 'Analyze My Patterns'}
                      </button>
                    )}
                    {appState.journal.length < 2 && !deepReflection && (
                      <p className="text-xs mt-4 text-indigo-200 font-bold">Need at least 2 journal entries to begin analysis.</p>
                    )}
                  </div>
                  <div className="absolute top-0 right-0 p-8 text-8xl opacity-10 rotate-12">
                    <i className="fas fa-brain"></i>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'journal' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">Your Reflection Log</h3>
                <VoiceJournal onTranscription={(text) => saveJournalEntry(text)} />
              </div>
              {appState.journal.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <i className="fas fa-feather text-4xl text-slate-200 mb-4"></i>
                  <p className="text-slate-400 font-medium">No entries yet. Start by practicing a protocol.</p>
                </div>
              ) : (
                appState.journal.map(entry => (
                  <div key={entry.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{entry.protocol}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">"{entry.text}"</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-3xl mx-auto">
              <AIChat />
            </div>
          )}

          {activeTab === 'edu' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-2xl font-bold mb-4 text-indigo-600">The 3-State Model</h3>
                <div className="space-y-6">
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="font-bold text-indigo-600">Ventral Vagal (Safe)</h4>
                    <p className="text-sm text-slate-500">Calm, connected, curious. Heart rate is steady, digestion is working. This is where we rest and heal.</p>
                  </div>
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h4 className="font-bold text-amber-500">Sympathetic (Active)</h4>
                    <p className="text-sm text-slate-500">Fight or Flight. High energy, anxiety, panic. Heart races, breathing is shallow. Useful for survival, taxing for daily life.</p>
                  </div>
                  <div className="border-l-4 border-slate-400 pl-4">
                    <h4 className="font-bold text-slate-400">Dorsal Vagal (Shutdown)</h4>
                    <p className="text-sm text-slate-500">Freeze or Faint. Numbness, dissociation, depression. Energy drops to almost nothing as a last-resort protection.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-2xl font-bold mb-4 text-emerald-600">Technique Science</h3>
                <ul className="space-y-4 text-sm text-slate-500 leading-relaxed">
                  <li><strong>Physiological Sigh:</strong> Offloads maximum CO2, signaling the brain stem to immediately drop heart rate.</li>
                  <li><strong>Bilateral Stimulation:</strong> Interacts with both brain hemispheres to calm the amygdala's fear center.</li>
                  <li><strong>Cold Dive Reflex:</strong> Triggers the Vagus nerve to slow metabolic processes and heart rate instantly.</li>
                  <li><strong>Box Breathing:</strong> Balances oxygen and CO2 while creating predictable sensory input for the brain.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <h3 className="text-3xl font-black mb-6">Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <i className="fas fa-user-circle text-indigo-600"></i> Account Profile
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Name</label>
                      <input 
                        type="text" 
                        value={appState.profile?.name || ''} 
                        onChange={(e) => setAppState(prev => ({ ...prev, profile: { ...prev.profile!, name: e.target.value } }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                      <input 
                        type="email" 
                        value={appState.profile?.email || ''} 
                        onChange={(e) => setAppState(prev => ({ ...prev, profile: { ...prev.profile!, email: e.target.value } }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <i className="fas fa-phone-flip text-red-500"></i> Emergency Contact
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Contact Name</label>
                      <input 
                        type="text" 
                        value={appState.emergencyContact?.name || ''} 
                        onChange={(e) => setAppState(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact!, name: e.target.value } }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm"
                        placeholder="Contact Name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Phone or Email</label>
                      <input 
                        type="text" 
                        value={appState.emergencyContact?.phone || appState.emergencyContact?.email || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const isEmail = val.includes('@');
                          setAppState(prev => ({ 
                            ...prev, 
                            emergencyContact: { 
                              ...prev.emergencyContact!, 
                              phone: isEmail ? '' : val,
                              email: isEmail ? val : ''
                            } 
                          }));
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm"
                        placeholder="Phone or Email"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Emergency Message</label>
                      <textarea 
                        value={appState.emergencyContact?.message || ''} 
                        onChange={(e) => setAppState(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact!, message: e.target.value } }))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm min-h-[80px]"
                      />
                    </div>
                    <button 
                      onClick={handleEmergencyTrigger}
                      className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
                    >
                      <i className="fas fa-paper-plane mr-2"></i> Test Emergency Message
                    </button>
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <i className="fas fa-sliders text-emerald-500"></i> Preferences
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">Daily Reminders</p>
                        <p className="text-xs text-slate-500">Get notified to practice regulation</p>
                      </div>
                      <button 
                        onClick={() => setAppState(prev => ({ ...prev, preferences: { ...prev.preferences!, notifications: !prev.preferences?.notifications } }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${appState.preferences?.notifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appState.preferences?.notifications ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">Haptic Feedback</p>
                        <p className="text-xs text-slate-500">Vibrate during breathing steps</p>
                      </div>
                      <button 
                        onClick={() => setAppState(prev => ({ ...prev, preferences: { ...prev.preferences!, haptics: !prev.preferences?.haptics } }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${appState.preferences?.haptics ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appState.preferences?.haptics ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">Audio Guidance</p>
                        <p className="text-xs text-slate-500">Enable AI voice instructions</p>
                      </div>
                      <button 
                        onClick={() => setAppState(prev => ({ ...prev, preferences: { ...prev.preferences!, audioEnabled: !prev.preferences?.audioEnabled } }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${appState.preferences?.audioEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appState.preferences?.audioEnabled ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="font-bold text-sm">Audio Volume</p>
                        <span className="text-xs font-bold text-indigo-600">{appState.preferences?.audioVolume}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={appState.preferences?.audioVolume || 80}
                        onChange={(e) => setAppState(prev => ({ ...prev, preferences: { ...prev.preferences!, audioVolume: parseInt(e.target.value) } }))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Support & Legal */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <i className="fas fa-circle-info text-amber-500"></i> Support & Legal
                  </h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setModalContent({
                        title: 'Help Center',
                        content: 'Welcome to the Circuit Breaker Help Center.\n\n1. How to use Protocols: Select a protocol that matches your current state (Panic, Freeze, or Insomnia). Follow the guided steps and breathing exercises.\n2. Voice Journaling: Use the microphone icon to record your reflections after a session. AI will transcribe and analyze your patterns.\n3. Emergency Contacts: Set up a trusted contact in Settings. In an emergency, you can quickly trigger a pre-written message to them.'
                      })}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">Help Center / FAQ</span>
                      <i className="fas fa-chevron-right text-xs text-slate-400"></i>
                    </button>
                    <a href="mailto:support@circuitbreaker.pro" className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between">
                      <span className="text-sm font-medium">Contact Support</span>
                      <i className="fas fa-chevron-right text-xs text-slate-400"></i>
                    </a>
                    <button 
                      onClick={() => setModalContent({
                        title: 'Privacy Policy',
                        content: 'Your privacy is our priority. All journal entries and profile data are stored locally on your device. We use the Gemini API for AI analysis and transcription, but your data is not used to train global models. We do not sell or share your personal information with third parties.'
                      })}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">Privacy Policy</span>
                      <i className="fas fa-chevron-right text-xs text-slate-400"></i>
                    </button>
                    <div className="pt-4">
                      <button 
                        onClick={handleSignOut}
                        className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Quick Action Floating Button (Optional) */}
      {!selectedProtocol && (
        <button 
          onClick={() => setSelectedProtocol(PROTOCOLS[0])}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 md:hidden"
        >
          <i className="fas fa-bolt"></i>
        </button>
      )}
      {/* Modal for Help/Privacy */}
      {modalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-xl font-bold">{modalContent.title}</h4>
              <button onClick={() => setModalContent(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {modalContent.content}
              </p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button 
                onClick={() => setModalContent(null)}
                className="bg-indigo-600 text-white font-bold py-2 px-8 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
