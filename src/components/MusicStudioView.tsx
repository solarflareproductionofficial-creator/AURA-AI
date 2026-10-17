import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCw, 
  Sliders, 
  Volume2, 
  Disc, 
  Radio, 
  Activity,
  Layers
} from 'lucide-react';
import { MusicTrack } from '../types';
import { 
  playFullMusicTrack, 
  stopCurrentPlayback, 
  playNote, 
  playChord, 
  playDrum,
  getAudioAnalyser 
} from '../lib/audioSynth';

interface MusicStudioViewProps {
  initialPrompt?: string;
}

export const MusicStudioView: React.FC<MusicStudioViewProps> = ({ initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [genre, setGenre] = useState('lofi');
  const [mood, setMood] = useState('relaxed');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stopPlaybackRef = useRef<(() => void) | null>(null);

  const genrePresets = [
    { id: 'lofi', label: 'Lo-Fi Chill & Ders', desc: '82 BPM, sıcak analog piyano ve çıtırtılar' },
    { id: 'synthwave', label: 'Siberpunk Synthwave', desc: '118 BPM, güçlü arpej ve bas ritimleri' },
    { id: 'ambient', label: 'Derin Odaklanma & Zen', desc: '65 BPM, eterik atmosfer ve dinginlik' },
    { id: 'orchestral', label: 'Epik Sinematik', desc: '95 BPM, orkestral yaylılar ve derin vuruşlar' },
  ];

  // Visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderBars = () => {
      const analyser = getAudioAnalyser();
      const bufferLength = analyser ? analyser.frequencyBinCount : 32;
      const dataArray = new Uint8Array(bufferLength);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // subtle idle breathing wave
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = isPlaying ? Math.random() * 80 + 20 : Math.sin(Date.now() / 300 + i) * 15 + 18;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

        // Gradient color from amber to magenta to cyan
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#06b6d4');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(renderBars);
    };

    renderBars();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleGenerateMusic = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    stopCurrentPlayback();
    setIsPlaying(false);

    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genre,
          mood,
        }),
      });

      if (!response.ok) {
        throw new Error('Müzik bestelenemedi');
      }

      const track: MusicTrack = await response.json();
      setCurrentTrack(track);
    } catch (err) {
      console.error(err);
      alert('Müzik oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlay = () => {
    if (!currentTrack) return;

    if (isPlaying) {
      stopCurrentPlayback();
      setIsPlaying(false);
      setPlaybackProgress(0);
    } else {
      setIsPlaying(true);
      const stopper = playFullMusicTrack(
        currentTrack,
        (progress) => setPlaybackProgress(progress),
        () => {
          setIsPlaying(false);
          setPlaybackProgress(0);
        }
      );
      stopPlaybackRef.current = stopper;
    }
  };

  // Interactive keyboard notes
  const interactiveKeys = [
    { note: 'C4', freq: 261.63 },
    { note: 'D4', freq: 293.66 },
    { note: 'E4', freq: 329.63 },
    { note: 'F4', freq: 349.23 },
    { note: 'G4', freq: 392.0 },
    { note: 'A4', freq: 440.0 },
    { note: 'B4', freq: 493.88 },
    { note: 'C5', freq: 523.25 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Music className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Müzik & Ses Sentezleme Stüdyosu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Yapay zeka ile çalışma müzikleri, lo-fi beatler ve ambiyans parçaları bestele; tarayıcıda canlı çal.
          </p>
        </div>
      </div>

      {/* Main Studio Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input & Config */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Müzik Teması veya Atmosfer
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Örn: Gece ders çalışırken zihni açan, sıcak piyano akorlu ve yağmur hissi veren 85 BPM lo-fi..."
                className="w-full p-3.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
              />
            </div>

            {/* Quick genres */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Müzik Tarzı & Hız (BPM)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {genrePresets.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGenre(g.id)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      genre === g.id
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs font-bold">{g.label}</p>
                    <p className="text-[10px] opacity-70 truncate">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateMusic}
              disabled={!prompt.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 shadow-lg shadow-amber-500/25 transition-all hover:scale-102"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Akorlar ve Melodiler Hesaplanıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Müziği Bestele</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Live Pads & Synth Keyboard */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Canlı Beat & Synthesizer Padleri
              </span>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                Dokun & Çal
              </span>
            </div>

            {/* Drum Pads */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => playDrum('kick')}
                className="py-3 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-700 shadow-sm active:scale-95 transition"
              >
                🥁 Kick (808)
              </button>
              <button
                onClick={() => playDrum('snare')}
                className="py-3 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-700 shadow-sm active:scale-95 transition"
              >
                💥 Snare
              </button>
              <button
                onClick={() => playDrum('hihat')}
                className="py-3 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-700 shadow-sm active:scale-95 transition"
              >
                ✨ Hi-Hat
              </button>
            </div>

            {/* Piano Keys */}
            <div className="grid grid-cols-8 gap-1 pt-2">
              {interactiveKeys.map((k) => (
                <button
                  key={k.note}
                  onClick={() => playNote(k.freq, 0.4, 'triangle', 0.3)}
                  className="py-4 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-900 dark:text-amber-200 hover:text-white border border-amber-500/30 text-[11px] font-bold active:scale-90 transition flex flex-col items-center justify-end"
                >
                  <span>{k.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Audio Visualizer & Player Box */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl flex flex-col justify-between min-h-[380px] relative overflow-hidden">
            {/* Background glow orb */}
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header info */}
            <div className="flex items-center justify-between z-10 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Disc className={`w-5 h-5 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {currentTrack ? currentTrack.title : 'AURA Synthesizer Stüdyo'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400">
                {currentTrack ? `${currentTrack.bpm} BPM • ${currentTrack.key}` : 'Canlı Ses Motoru'}
              </span>
            </div>

            {/* Live Audio Visualizer Canvas */}
            <div className="my-6 z-10 flex flex-col items-center justify-center">
              <canvas
                ref={canvasRef}
                width={360}
                height={130}
                className="w-full max-w-sm h-32 rounded-xl"
              />
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Web Audio Çok Sesli Frekans Analizi</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="z-10 space-y-3">
              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 via-pink-500 to-cyan-400 h-full rounded-full transition-all duration-100"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400 font-mono">
                  {currentTrack ? currentTrack.genre.toUpperCase() : 'LOFI'}
                </div>

                <button
                  onClick={handleTogglePlay}
                  disabled={!currentTrack}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 disabled:opacity-40 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </button>

                <div className="text-xs text-slate-400 font-medium">
                  {isPlaying ? 'Çalıyor...' : currentTrack ? 'Hazır' : 'Beklemede'}
                </div>
              </div>

              {currentTrack && currentTrack.description && (
                <p className="text-xs text-slate-300 italic pt-2 border-t border-slate-800 leading-relaxed">
                  "{currentTrack.description}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
