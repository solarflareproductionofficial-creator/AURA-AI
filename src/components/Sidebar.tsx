import React from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Music, 
  GraduationCap, 
  LayoutDashboard, 
  BrainCircuit, 
  Calendar as CalendarIcon, 
  Lock, 
  Plus, 
  Trash2, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { AppTab, ChatMessage, AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface SidebarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onNewChat: () => void;
  onClearHistory: () => void;
  adaptiveWeight: number;
  language: AppLanguage;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
  messages,
  onNewChat,
  onClearHistory,
  adaptiveWeight,
  language,
}) => {
  const t = translations[language] || translations.tr;

  const navItems = [
    {
      id: 'chat' as AppTab,
      label: t.tabChat,
      desc: t.tabChatDesc,
      icon: MessageSquare,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'image_studio' as AppTab,
      label: t.tabImage,
      desc: t.tabImageDesc,
      icon: ImageIcon,
      gradient: 'from-fuchsia-500 to-pink-600',
    },
    {
      id: 'music_studio' as AppTab,
      label: t.tabMusic,
      desc: t.tabMusicDesc,
      icon: Music,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'study_summarizer' as AppTab,
      label: t.tabStudy,
      desc: t.tabStudyDesc,
      icon: GraduationCap,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'dashboard' as AppTab,
      label: t.tabDashboard,
      desc: t.tabDashboardDesc,
      icon: LayoutDashboard,
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'learning_engine' as AppTab,
      label: t.tabLearning,
      desc: t.tabLearningDesc,
      icon: BrainCircuit,
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      id: 'calendar' as AppTab,
      label: t.tabCalendar,
      desc: t.tabCalendarDesc,
      icon: CalendarIcon,
      gradient: 'from-rose-500 to-red-600',
    },
    {
      id: 'vault' as AppTab,
      label: t.tabVault,
      desc: t.tabVaultDesc,
      icon: Lock,
      gradient: 'from-slate-600 to-slate-800',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Main Drawer / Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-hidden p-4">
          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              setCurrentTab('chat');
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newChat}</span>
          </button>

          {/* Navigation Links */}
          <div className="mt-5 space-y-1 overflow-y-auto pr-1 flex-1">
            <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 px-3 py-1">
              {t.modules}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    onClose();
                  }}
                  className={`w-full group flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all ${
                    isActive
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-900/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl text-white bg-gradient-to-br ${item.gradient} shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-indigo-900 dark:text-white' : ''}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {item.desc}
                    </p>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
                </button>
              );
            })}
          </div>

          {/* Quick Chat Snippets if any */}
          {messages.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Son Oturum ({messages.length} mesaj)
                </span>
                <button
                  onClick={onClearHistory}
                  title="Sohbeti Temizle"
                  className="text-slate-400 hover:text-rose-500 transition p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {messages.slice(-3).map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setCurrentTab('chat');
                      onClose();
                    }}
                    className="cursor-pointer text-[11px] truncate px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                  >
                    {m.role === 'user' ? '👤 ' : '✨ '}
                    {m.text.slice(0, 32)}...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Adaptive Engine status card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Adaptif Nöral Bellek
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-cyan-400">
              %{Math.round(adaptiveWeight * 100)}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round(adaptiveWeight * 100)}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>GAME WORKS STUDIO</span>
            <span className="font-semibold text-indigo-500">v4.8 PRO</span>
          </div>
        </div>
      </aside>
    </>
  );
};
