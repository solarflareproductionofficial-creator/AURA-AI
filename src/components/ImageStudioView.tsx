import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Wand2, 
  Layers, 
  RotateCw, 
  Maximize2,
  Copy,
  Check
} from 'lucide-react';

interface ImageStudioViewProps {
  initialPrompt?: string;
}

export const ImageStudioView: React.FC<ImageStudioViewProps> = ({ initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [style, setStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const styleOptions = [
    { id: 'cinematic', label: 'Sinematik Film', desc: 'Dramatik ışık ve 35mm lens efekti' },
    { id: 'cyberpunk', label: 'Siberpunk & Neon', desc: 'Gece şehri, neon mavi ve fuşya parıltılar' },
    { id: '3d_render', label: '3D Hiper-Gerçekçi', desc: 'Octane render, kristal netlik ve hacim' },
    { id: 'anime', label: 'Studio Anime', desc: 'Miyazaki tarzı zengin renk paleti' },
    { id: 'minimalist', label: 'Vektörel Minimalist', desc: 'Temiz hatlar, modern geometri' },
    { id: 'oil_painting', label: 'Klasik Yağlı Boya', desc: 'Zengin dokular ve sanatsal fırça izleri' },
  ];

  const presets = [
    'Gece yağmuru altında parlayan neon ışıklı fütüristik metropol kulesi',
    'Uzay boşluğunda süzülen altın yapraklı antik kütüphane, yıldız tozları',
    'Biyomekanik parlayan zümrüt gözlü mekanik anka kuşu, 8K ultra detay',
    'İskandinav fiyortlarında minimalist cam ev ve kuzey ışıkları dansı',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style,
          aspectRatio,
        }),
      });

      if (!response.ok) {
        throw new Error('Görsel üretilemedi');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setImageMeta(data);
    } catch (err) {
      console.error(err);
      alert('Görsel oluşturulurken bir problem oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (imageMeta?.enhancedPrompt) {
      navigator.clipboard.writeText(imageMeta.enhancedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
          <ImageIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Görsel & Fotoğraf Üretim Stüdyosu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            En yeni nesil üretken yapay zeka ile 8K ultra çözünürlüklü dijital sanat, fotoğraf ve konsept çizimler oluştur.
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Settings & Prompt */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Görsel İstemi (Prompt)
                </label>
                <div className="flex items-center gap-1 text-[11px] text-fuchsia-600 dark:text-fuchsia-400 font-medium">
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Gemini Prompt Geliştirici Aktif</span>
                </div>
              </div>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Görmek istediğin manzarayı, karakteri veya konsepti detaylıca tarif et..."
                className="w-full p-3.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 leading-relaxed"
              />
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Örnek İlhamlar:</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(p)}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-fuchsia-50 dark:bg-slate-800 dark:hover:bg-fuchsia-950/50 text-slate-600 hover:text-fuchsia-700 dark:text-slate-300 dark:hover:text-fuchsia-300 transition text-left"
                  >
                    {p.slice(0, 36)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Sanat Tarzı
              </label>
              <div className="grid grid-cols-2 gap-2">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStyle(opt.id)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      style === opt.id
                        ? 'border-fuchsia-500 bg-fuchsia-50/60 dark:bg-fuchsia-950/40 text-fuchsia-900 dark:text-fuchsia-200 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] opacity-70 truncate">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                En/Boy Oranı
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1:1', label: '1:1 Kare', icon: '■' },
                  { id: '16:9', label: '16:9 Yatay', icon: '▬' },
                  { id: '9:16', label: '9:16 Dikey', icon: '▮' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      aspectRatio === ratio.id
                        ? 'border-fuchsia-500 bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="mr-1.5">{ratio.icon}</span>
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 disabled:opacity-40 shadow-lg shadow-fuchsia-500/25 transition-all hover:scale-102"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Nöral Piksel Ağları İşleniyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Fotoğrafı Üret</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Render Preview */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex-1 min-h-[380px] p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-fuchsia-500" />
                <span>Üretilen Sanat Eseri & Çıktı</span>
              </span>
              {generatedImage && (
                <a
                  href={generatedImage}
                  download="aura_artwork.png"
                  className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>8K İndir</span>
                </a>
              )}
            </div>

            {/* Image Canvas Box */}
            <div className="flex-1 my-4 flex items-center justify-center rounded-2xl overflow-hidden bg-slate-950 relative border border-slate-800">
              {isLoading ? (
                <div className="text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center mx-auto text-fuchsia-400 animate-spin">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">Yapay Zeka Görseli Şekillendiriyor</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Işık, kompozisyon, hacimsel gölgeler ve dokular hesaplanıyor...
                  </p>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Üretilen Görsel"
                  className="w-full h-full object-contain max-h-[440px] rounded-2xl animate-in zoom-in-95 duration-300"
                />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">
                    Henüz görsel üretilmedi.
                  </p>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Soldaki panelden prompt ve stilini seçip 'Fotoğrafı Üret' butonuna tıkla.
                  </p>
                </div>
              )}
            </div>

            {/* Prompt details if generated */}
            {imageMeta && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Zenginleştirilmiş Nöral Prompt:
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {imageMeta.enhancedPrompt}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
