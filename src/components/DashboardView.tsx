import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Server, 
  TrendingUp, 
  Clock, 
  Cpu, 
  Globe2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface DashboardViewProps {
  metrics: SystemMetrics;
  currentLatency: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ metrics, currentLatency }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);

  // Latency timeline data points (ms)
  const latencyHistory = [
    { time: '09:00', ms: 142 },
    { time: '11:00', ms: 128 },
    { time: '13:00', ms: 165 },
    { time: '15:00', ms: 139 },
    { time: '17:00', ms: 151 },
    { time: '19:00', ms: 132 },
    { time: '21:00', ms: currentLatency || 140 },
  ];

  // Token throughput data
  const tokenThroughputData = [
    { label: '02:00', val: 42 },
    { label: '06:00', val: 78 },
    { label: '10:00', val: 195 },
    { label: '14:00', val: 240 },
    { label: '18:00', val: 310 },
    { label: '22:00', val: 285 },
  ];

  const categories = [
    { name: 'Ders & Not Özetleri', pct: 38, color: 'bg-emerald-500', text: 'text-emerald-500' },
    { name: 'Görsel Stüdyosu (8K)', pct: 26, color: 'bg-fuchsia-500', text: 'text-fuchsia-500' },
    { name: 'Müzik & Synth Üretimi', pct: 21, color: 'bg-amber-500', text: 'text-amber-500' },
    { name: 'Kodlama & Analiz', pct: 15, color: 'bg-cyan-500', text: 'text-cyan-500' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Kişiselleştirilmiş Performans & Bulut Paneli
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Düşük gecikmeli bulut altyapısı, token verimi, uçtan uca şifreleme ve model adaptasyon metrikleri.
            </p>
          </div>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                timeRange === range
                  ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {range === 'today' ? 'Bugün' : range === 'week' ? 'Bu Hafta' : 'Bu Ay'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Latency */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Bulut Gecikmesi</span>
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {currentLatency > 0 ? currentLatency : metrics.avgLatencyMs}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">ms (Ultra Hızlı)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            P99: {metrics.p99LatencyMs}ms • Otomatik çoklu bölge dağıtımı
          </p>
        </div>

        {/* KPI 2: E2EE */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Veri Güvenliği</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              256-Bit
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">AES-GCM</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Sıfır bilgi (Zero-Knowledge) yerel anahtar şifrelemesi
          </p>
        </div>

        {/* KPI 3: Adaptation Score */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Öğrenme Adaptasyonu</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              %98.4
            </span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">+2.1% artış</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {metrics.memoryVectorsTrained} aktif nöral profil vektörü
          </p>
        </div>

        {/* KPI 4: Uptime & Cloud Health */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Çalışma Süresi</span>
            <Server className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              %{metrics.uptimePercent}
            </span>
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Aktif</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {metrics.cloudRegion}
          </p>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Latency Timeline SVG Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Gerçek Zamanlı Uçtan Uca Gecikme Grafiği
              </h3>
              <p className="text-xs text-slate-400">
                Bulut yanıt sürelerinin zaman içindeki dağılımı (Milisaniye)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
              Ort: 142ms
            </span>
          </div>

          {/* SVG Smooth Curve */}
          <div className="relative pt-4">
            <svg viewBox="0 0 500 160" className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="4" />

              {/* Area polygon */}
              <polygon
                points="
                  0,150
                  0,90
                  80,105
                  160,65
                  240,95
                  320,80
                  400,100
                  500,92
                  500,150
                "
                fill="url(#latencyGradient)"
              />

              {/* Line path */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                points="
                  0,90
                  80,105
                  160,65
                  240,95
                  320,80
                  400,100
                  500,92
                "
              />

              {/* Interactive Dots */}
              {[
                { x: 0, y: 90, val: 142 },
                { x: 80, y: 105, val: 128 },
                { x: 160, y: 65, val: 165 },
                { x: 240, y: 95, val: 139 },
                { x: 320, y: 80, val: 151 },
                { x: 400, y: 100, val: 132 },
                { x: 500, y: 92, val: currentLatency || 140 },
              ].map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredDataPoint === i ? 6 : 4}
                    fill="#06b6d4"
                    stroke="#ffffff"
                    stroke-width="2"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredDataPoint(i)}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  />
                  {hoveredDataPoint === i && (
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      fill="#06b6d4"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {pt.val}ms
                    </text>
                  )}
                </g>
              ))}
            </svg>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>09:00</span>
              <span>12:00</span>
              <span>15:00</span>
              <span>18:00</span>
              <span>Şimdi</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kullanım & Modül Dağılımı
            </h3>
            <p className="text-xs text-slate-400">
              AURA AI yeteneklerinin kullanıcı etkileşim oranları
            </p>
          </div>

          <div className="space-y-3.5 my-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {cat.name}
                  </span>
                  <span className={`font-mono font-bold ${cat.text}`}>
                    %{cat.pct}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${cat.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-500">Toplam İşlenen Token:</span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-cyan-400">
              {metrics.totalTokensProcessed.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
