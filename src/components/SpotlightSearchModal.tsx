import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Image as ImageIcon, 
  Music, 
  GraduationCap, 
  LayoutDashboard, 
  BrainCircuit, 
  Calendar as CalendarIcon, 
  Lock, 
  X, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AppTab, ChatMessage, CalendarEvent } from '../types';
import { VoiceAssistant } from '../lib/voice';

interface SpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: AppTab) => void;
  messages: ChatMessage[];
  calendarEvents: CalendarEvent[];
  onExecutePrompt: (prompt: string) => void;
}

export const SpotlightSearchModal: React.FC<SpotlightSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  messages,
  calendarEvents,
  onExecutePrompt,
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const voiceAssistantRef = useRef<VoiceAssistant | null>(null);

  useEffect(() => {
    voiceAssistantRef.current = new VoiceAssistant();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleVoice = () => {
    if (!voiceAssistantRef.current?.isSupported) {
      alert('Ses tanıma desteklenmiyor.');
      return;
    }

    if (isListening) {
      voiceAssistantRef.current.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceAssistantRef.current.startListening(
        (transcript) => {
          setQuery(transcript);
          // Check for vocal navigation triggers
          const lower = transcript.toLowerCase();
          if (lower.includes('müzik') || lower.includes('şarkı')) {
            onSelectTab('music_studio');
            onClose();
          } else if (lower.includes('görsel') || lower.includes('resim') || lower.includes('fotoğraf')) {
            onSelectTab('image_studio');
            onClose();
          } else if (lower.includes('ders') || lower.includes('özet') || lower.includes('not')) {
            onSelectTab('study_summarizer');
            onClose();
          } else if (lower.includes('takvim') || lower.includes('hatırlat')) {
            onSelectTab('calendar');
            onClose();
          } else if (lower.includes('panel') || lower.includes('metrik')) {
            onSelectTab('dashboard');
            onClose();
          }
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );
    }
  };

  const navActions: { id: AppTab; label: string; icon: any; category: string }[] = [
    { id: 'chat', label: 'Yapay Zeka Sohbet & Asistan', icon: MessageSquare, category: 'Modül' },
    { id: 'study_summarizer', label: 'Akıllı Ders & Not Özetleyici', icon: GraduationCap, category: 'Modül' },
    { id: 'image_studio', label: '8K Fotoğraf & Görsel Stüdyosu', icon: ImageIcon, category: 'Modül' },
    { id: 'music_studio', label: 'Müzik & Synthesizer Stüdyosu', icon: Music, category: 'Modül' },
    { id: 'dashboard', label: 'Kişiselleştirilmiş Performans Paneli', icon: LayoutDashboard, category: 'Modül' },
    { id: 'learning_engine', label: 'Adaptif Nöral Öğrenme Motoru', icon: BrainCircuit, category: 'Modül' },
    { id: 'calendar', label: 'Takvim & Çalışma Hatırlatıcıları', icon: CalendarIcon, category: 'Modül' },
    { id: 'vault', label: 'E2EE Güvenlik Kasası', icon: Lock, category: 'Modül' },
  ];

  const filteredActions = navActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMessages = messages.filter((m) =>
    m.text.toLowerCase().includes(query.toLowerCase())
  );

  const filteredEvents = calendarEvents.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        {/* Search Input Box */}
        <div className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all ${
          isListening
            ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus-within:border-indigo-500'
        }`}>
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onExecutePrompt(query.trim());
                onClose();
              }
            }}
            placeholder={
              isListening
                ? 'Sesli komut dinleniyor... (Örn: Ders özetlerini aç)'
                : 'Uygulamada ara veya doğrudan bir soru sor... (Enter)'
            }
            className="flex-1 bg-transparent border-0 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />

          {/* Voice Command Button */}
          <button
            onClick={toggleVoice}
            className={`p-2 rounded-xl transition ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
            title="Sesli Komut Ver"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results list */}
        <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
          {/* Quick Nav Actions */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Modüller & Eylemler
            </span>
            {filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    onSelectTab(action.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-cyan-300">
                      {action.label}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                </button>
              );
            })}
          </div>

          {/* Messages results if any */}
          {query && filteredMessages.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Sohbet Geçmişi Eşleşmeleri
              </span>
              {filteredMessages.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectTab('chat');
                    onClose();
                  }}
                  className="cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 truncate"
                >
                  <span className="font-bold text-indigo-500 mr-2">
                    {m.role === 'user' ? 'Sen:' : 'Aura:'}
                  </span>
                  {m.text}
                </div>
              ))}
            </div>
          )}

          {/* Calendar results if any */}
          {query && filteredEvents.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Takvim Etkinlikleri
              </span>
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    onSelectTab('calendar');
                    onClose();
                  }}
                  className="cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between"
                >
                  <span>{evt.title} ({evt.date})</span>
                  <span className="text-[10px] text-indigo-500 font-bold">{evt.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
