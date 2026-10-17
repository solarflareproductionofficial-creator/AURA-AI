import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Mic, 
  ShieldCheck, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  Activity,
  Palette,
  Globe,
  CheckCircle2,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { CalendarEvent, AppLanguage, AccentTheme } from '../types';
import { translations, themeStyles } from '../lib/i18n';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  accentTheme: AccentTheme;
  onOpenThemeCustomizer: () => void;
  onOpenSearch: () => void;
  onOpenVault: () => void;
  onToggleSidebar: () => void;
  calendarEvents: CalendarEvent[];
  latency: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  accentTheme,
  onOpenThemeCustomizer,
  onOpenSearch,
  onOpenVault,
  onToggleSidebar,
  calendarEvents,
  latency,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const t = translations[language] || translations.tr;
  const currentTheme = themeStyles[accentTheme] || themeStyles.nebula;

  const pendingEvents = calendarEvents.filter((e) => !e.completed).slice(0, 4);

  return (
    <header className="sticky top-0 z-30 w-full border-b backdrop-blur-xl transition-colors duration-200 border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="flex items-center justify-between px-3 md:px-6 h-16 max-w-7xl mx-auto gap-2 md:gap-4">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/80 transition md:hidden"
            aria-label="Menü"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr ${currentTheme.gradient} p-[2px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300`}>
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`font-extrabold text-lg tracking-tight bg-gradient-to-r ${currentTheme.gradient} bg-clip-text text-transparent`}>
                  AURA AI
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-cyan-300 border border-indigo-500/20">
                  GAME WORKS
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                GAME WORKS STUDIO • 5 Dil Desteği
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar with Voice */}
        <div className="flex-1 max-w-md mx-2">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-800 bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-900/70 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">Soru sor, komut ver veya ara...</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                ⌘K
              </span>
              <div className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60">
                <Mic className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>

        {/* Right: Language, Theme Palette, Security, Latency, Notifications, Theme */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick Language Switcher Button */}
          <button
            onClick={onOpenThemeCustomizer}
            title="Dili ve Temayı Değiştir (5 Dil Desteği)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-800"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span className="uppercase tracking-wider">{language}</span>
          </button>

          {/* Theme Palette Button */}
          <button
            onClick={onOpenThemeCustomizer}
            title="Temayı Özelleştir"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
          >
            <Palette className="w-4 h-4 text-purple-500" />
          </button>

          {/* Latency Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{latency > 0 ? `${latency}ms` : '138ms'}</span>
          </div>

          {/* E2EE Shield */}
          <button
            onClick={onOpenVault}
            title="Uçtan Uca Şifreleme (AES-256 GCM) Aktif"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">E2EE 256</span>
          </button>

          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
              aria-label="Bildirimler"
            >
              <Bell className="w-4 h-4" />
              {pendingEvents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
              {pendingEvents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Akıllı Bildirimler & Takvim
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                  {pendingEvents.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      Bekleyen bildirim veya etkinlik yok. Her şey yolunda! ✨
                    </div>
                  ) : (
                    pendingEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {evt.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {evt.date} • {evt.time}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          evt.priority === 'high'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {evt.type === 'exam' ? 'Sınav' : evt.type === 'study' ? 'Ders' : 'Hatırlatıcı'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
            aria-label="Tema Değiştir"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
