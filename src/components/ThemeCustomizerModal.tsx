import React from 'react';
import { Palette, Globe, Sun, Moon, Check, X, Sparkles, Building2 } from 'lucide-react';
import { AppLanguage, AccentTheme } from '../types';
import { themeStyles, translations } from '../lib/i18n';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentTheme: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  accentTheme,
  setAccentTheme,
  language,
  setLanguage,
  darkMode,
  setDarkMode,
}) => {
  if (!isOpen) return null;
  const t = translations[language] || translations.tr;

  const languages: { id: AppLanguage; label: string; flag: string }[] = [
    { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { id: 'es', label: 'Español', flag: '🇪🇸' },
    { id: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t.themeCustomizer} & Dil Ayarları
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AURA AI görünümünü ve iletişim dilini kişiselleştir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Language Switcher (At least 5 languages) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Asistan & Arayüz Dili (5 Dil Desteği)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`p-3 rounded-2xl text-left border flex items-center justify-between transition-all ${
                  language === l.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{l.flag}</span>
                  <span className="text-xs font-bold">{l.label}</span>
                </div>
                {language === l.id && <Check className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Accent Themes */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Vurgu & Gradyan Teması</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(themeStyles).map(([key, style]) => (
              <button
                key={key}
                onClick={() => setAccentTheme(key as AccentTheme)}
                className={`p-3 rounded-2xl text-left border flex items-center justify-between transition-all ${
                  accentTheme === key
                    ? 'border-indigo-500 bg-slate-50 dark:bg-slate-800/80 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: style.preview }}
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {style.name}
                  </span>
                </div>
                {accentTheme === key && (
                  <Check className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Dark / Light Mode */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {darkMode ? 'Karanlık Mod (Aktif)' : 'Aydınlık Mod (Aktif)'}
            </span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
          >
            Mod Değiştir
          </button>
        </div>

        {/* Developer Attribution Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Yapay Zeka Yapımcısı
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                GAME WORKS STUDIO
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
            Resmi Sürüm
          </span>
        </div>
      </div>
    </div>
  );
};
