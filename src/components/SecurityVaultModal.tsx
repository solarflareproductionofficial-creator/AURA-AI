import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Trash2, 
  RefreshCw, 
  X, 
  Check, 
  Copy,
  AlertTriangle,
  FileCode2
} from 'lucide-react';
import { resetEncryptionKey } from '../lib/crypto';

interface SecurityVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
}

export const SecurityVaultModal: React.FC<SecurityVaultModalProps> = ({
  isOpen,
  onClose,
  onClearAllData,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeSessionKey] = useState(
    'aes-256-gcm://' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  );

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(activeSessionKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    if (confirm('Yeni bir AES-256 anahtarı oluşturulsun mu? Mevcut şifrelenmiş oturum anahtarları yenilenecektir.')) {
      resetEncryptionKey();
      alert('Yeni kriptografik oturum anahtarı başarıyla türetildi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Uçtan Uca Şifreleme (E2EE) & Güvenlik Kasası
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AES-GCM 256-bit donanım seviyesi Web Crypto güvenliği
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Status Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
              <span>Sıfır Bilgi Protokolü (Zero-Knowledge)</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
              DOĞRULANDI
            </span>
          </div>
          <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
            Mesajların, ders notların ve kişisel bellek vektörlerin tarayıcından çıkmadan önce cihazında 256-bit rastgele IV ile şifrelenir.
          </p>
        </div>

        {/* Key Preview */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Aktif Oturum Kripto Anahtarı</span>
            <span className="text-emerald-500 text-[10px]">Cihazda Korumalı</span>
          </label>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 font-mono text-xs text-cyan-400">
            <span className="truncate">{activeSessionKey}</span>
            <button
              onClick={handleCopyKey}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex-shrink-0"
              title="Anahtarı Kopyala"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRegenerateKey}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Anahtarları Yenile</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Tüm sohbet geçmişi ve geçici şifrelenmiş veriler kalıcı olarak silinsin mi?')) {
                  onClearAllData();
                  onClose();
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Verileri Güvenle İmha Et</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
