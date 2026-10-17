import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  RotateCw, 
  Check, 
  Trash2, 
  Plus, 
  Sliders, 
  Activity, 
  Cpu,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { MemoryVector } from '../types';

interface AdaptiveLearningViewProps {
  memoryVectors: MemoryVector[];
  onUpdateVectors: (vectors: MemoryVector[]) => void;
  adaptiveScore: number;
}

export const AdaptiveLearningView: React.FC<AdaptiveLearningViewProps> = ({
  memoryVectors,
  onUpdateVectors,
  adaptiveScore,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<'tone' | 'interest' | 'language' | 'study_field' | 'music_taste'>('interest');

  const handleRunSelfLearningCycle = () => {
    setIsUpdating(true);
    setTimeout(() => {
      // Simulate adaptation epoch updating weights
      const updated = memoryVectors.map((v) => ({
        ...v,
        weight: Math.min(1.0, +(v.weight + 0.04).toFixed(2)),
        lastUpdated: 'Az önce güncellendi',
      }));
      onUpdateVectors(updated);
      setIsUpdating(false);
    }, 1800);
  };

  const handleAddVector = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const newVec: MemoryVector = {
      id: `mem_${Date.now()}`,
      category: newCategory,
      key: newKey.trim(),
      value: newValue.trim(),
      weight: 0.85,
      lastUpdated: 'Şimdi eklendi',
    };
    onUpdateVectors([...memoryVectors, newVec]);
    setNewKey('');
    setNewValue('');
  };

  const handleDeleteVector = (id: string) => {
    onUpdateVectors(memoryVectors.filter((v) => v.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Sürekli Kendini Güncelleyen Öğrenme Motoru
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              AURA AI arka planda etkileşimlerini analiz eder, dil ve çalışma alışkanlıklarına göre nöral ağırlıklarını optimize eder.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunSelfLearningCycle}
          disabled={isUpdating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:scale-105 transition disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>{isUpdating ? 'Ağırlıklar Eğitiliyor...' : 'Öğrenme Döngüsünü Çalıştır'}</span>
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Adaptasyon İndeksi
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
              %{Math.round(adaptiveScore * 100)}
            </span>
            <span className="text-xs font-semibold text-emerald-500">Mükemmel Uyum</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Kullanıcı yanıtlarına göre kişiselleştirilmiş prompt ağırlığı
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Aktif Hafıza Vektörleri
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {memoryVectors.length}
            </span>
            <span className="text-xs font-semibold text-slate-400">Kavram Düğümü</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Ders ilgi alanları, müzik zevki, dil ve ton tercihleri
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Gizlilik & Depolama
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
              E2EE
            </span>
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Yerel Kripto</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Öğrenme vektörlerin cihazında şifreli olarak barındırılır
          </p>
        </div>
      </div>

      {/* Memory Vectors List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Öğrenilmiş Kullanıcı Bellek Vektörleri
            </h3>
            <p className="text-xs text-slate-400">
              AURA AI bu bilgileri kullanarak her yanıtta senin stilini yansıtır. İstediğini düzenleyebilir veya silebilirsin.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-500 font-bold">
            Model: gemini-3.8-flash (Adaptive)
          </span>
        </div>

        <div className="space-y-3">
          {memoryVectors.map((vec) => (
            <div
              key={vec.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {vec.key}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {vec.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {vec.value}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">Ağırlık:</span>
                  <div className="w-20 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${vec.weight * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(vec.weight * 100)}%
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteVector(vec.id)}
                  title="Vektörü Sil"
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Vector */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Yeni Tercih / Nöral Bilgi Ekle
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            >
              <option value="interest">İlgi Alanı</option>
              <option value="tone">Ton & Üslup</option>
              <option value="study_field">Ders / Uzmanlık</option>
              <option value="language">Dil Tercihi</option>
              <option value="music_taste">Müzik Zevki</option>
            </select>
            <input
              type="text"
              placeholder="Anahtar (Örn: Dil Stili)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Değer (Örn: Samimi, akademik ve yıldızsız)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            <button
              onClick={handleAddVector}
              disabled={!newKey.trim() || !newValue.trim()}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Hafızaya Yaz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
