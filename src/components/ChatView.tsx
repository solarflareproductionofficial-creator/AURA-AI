import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  CalendarPlus, 
  BookOpen, 
  Image as ImageIcon, 
  Music, 
  Download, 
  RefreshCw, 
  Zap, 
  ShieldCheck,
  Play,
  Pause,
  Paperclip,
  X,
  FileText,
  Brain,
  BrainCircuit,
  Building2
} from 'lucide-react';
import { ChatMessage, MusicTrack, CalendarEvent, AttachedFile, AppLanguage, AccentTheme } from '../types';
import { speakText, stopSpeaking, VoiceAssistant } from '../lib/voice';
import { playFullMusicTrack, stopCurrentPlayback } from '../lib/audioSynth';
import { parseVoiceCommand, VoiceCommandResult } from '../lib/voiceCommands';
import { translations, themeStyles, voiceLangCodes } from '../lib/i18n';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, forceType?: 'image' | 'music' | 'chat', attachments?: AttachedFile[]) => Promise<void>;
  isLoading: boolean;
  onAddEventToCalendar: (event: Omit<CalendarEvent, 'id'>) => void;
  onOpenStudySummarizerWithText: (text: string) => void;
  onOpenImageStudioWithPrompt: (prompt: string) => void;
  onOpenMusicStudioWithPrompt: (prompt: string) => void;
  onSaveMemory: (key: string, value: string) => void;
  onVoiceCommandAction: (commandResult: VoiceCommandResult) => void;
  language: AppLanguage;
  accentTheme: AccentTheme;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onAddEventToCalendar,
  onOpenStudySummarizerWithText,
  onOpenImageStudioWithPrompt,
  onOpenMusicStudioWithPrompt,
  onSaveMemory,
  onVoiceCommandAction,
  language,
  accentTheme,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [quickMode, setQuickMode] = useState<'standard' | 'image' | 'music'>('standard');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [thinkingStep, setThinkingStep] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceAssistantRef = useRef<VoiceAssistant | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopMusicRef = useRef<(() => void) | null>(null);

  const t = translations[language] || translations.tr;
  const currentTheme = themeStyles[accentTheme] || themeStyles.nebula;

  const THINKING_PHRASES: Record<AppLanguage, string[]> = {
    tr: [
      'Nöral ağlar ve derin modeller yanıtı şekillendiriyor...',
      'GAME WORKS STUDIO motoru en doğru bilgiyi sentezliyor...',
      'Bağlam ve veriler yüksek hızda analiz ediliyor...',
      'En berrak ve şık ifade hazırlanıyor...',
    ],
    en: [
      'Neural networks are synthesizing the response...',
      'GAME WORKS STUDIO engine formulating insights...',
      'Deep context and knowledge analysis in progress...',
      'Polishing clear, pristine thoughts for you...',
    ],
    de: [
      'Neuronale Netze synthetisieren die Antwort...',
      'GAME WORKS STUDIO Engine verarbeitet Daten...',
      'Kontextanalyse mit hoher Geschwindigkeit läuft...',
      'Klare und präzise Formulierung wird vorbereitet...',
    ],
    es: [
      'Las redes neuronales están sintetizando la respuesta...',
      'El motor de GAME WORKS STUDIO procesa la información...',
      'Análisis profundo del contexto en curso...',
      'Preparando una respuesta clara y pulida...',
    ],
    fr: [
      'Les réseaux de neurones synthétisent la réponse...',
      'Le moteur GAME WORKS STUDIO formule la réponse...',
      'Analyse approfondie du contexte en cours...',
      'Formulation d\'une réponse claire et soignée...',
    ],
  };

  const currentThinkingPhrases = THINKING_PHRASES[language] || THINKING_PHRASES.tr;

  // Cycle thinking phrases when isLoading is true
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setThinkingStep(0);
      interval = setInterval(() => {
        setThinkingStep((prev) => (prev + 1) % currentThinkingPhrases.length);
      }, 1600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, currentThinkingPhrases.length]);

  useEffect(() => {
    voiceAssistantRef.current = new VoiceAssistant();
    voiceAssistantRef.current.setLanguage(voiceLangCodes[language] || 'tr-TR');
    return () => {
      stopSpeaking();
      stopCurrentPlayback();
    };
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    if ((!textToSend.trim() && attachments.length === 0) || isLoading) return;

    const filesToSend = [...attachments];
    setInputText('');
    setAttachments([]);
    const type = quickMode !== 'standard' ? quickMode : undefined;
    setQuickMode('standard');
    await onSendMessage(textToSend || 'Yüklenen dosyayı incele ve açıkla.', type, filesToSend);
  };

  const toggleVoiceRecording = () => {
    if (!voiceAssistantRef.current?.isSupported) {
      alert('Tarayıcınız ses tanıma API özelliğini desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın.');
      return;
    }

    if (isListening) {
      voiceAssistantRef.current.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceAssistantRef.current.setLanguage(voiceLangCodes[language] || 'tr-TR');
      voiceAssistantRef.current.startListening(
        (transcript) => {
          setInputText(transcript);

          // Check if it's an actionable voice command
          const commandResult = parseVoiceCommand(transcript, language);
          if (commandResult.isCommand) {
            voiceAssistantRef.current?.stopListening();
            setIsListening(false);
            setVoiceNotice(commandResult.feedbackText);
            speakText(commandResult.feedbackText, voiceLangCodes[language]);
            onVoiceCommandAction(commandResult);
            setTimeout(() => setVoiceNotice(null), 4000);
          }
        },
        () => {
          setIsListening(false);
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsListening(false);
        }
      );
    }
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();

      if (isImg) {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          const newAtt: AttachedFile = {
            id: `att_${Date.now()}_${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            base64: base64Data,
            isImage: true,
          };
          setAttachments((prev) => [...prev, newAtt]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          const content = reader.result as string;
          const newAtt: AttachedFile = {
            id: `att_${Date.now()}_${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content,
            isImage: false,
          };
          setAttachments((prev) => [...prev, newAtt]);
        };
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      stopSpeaking();
      setSpeakingId(id);
      speakText(text, voiceLangCodes[language]).finally(() => {
        setSpeakingId(null);
      });
    }
  };

  const handleToggleMusicPlayback = (track: MusicTrack) => {
    if (playingTrackId === track.id) {
      stopCurrentPlayback();
      setPlayingTrackId(null);
      setTrackProgress(0);
    } else {
      stopCurrentPlayback();
      setPlayingTrackId(track.id);
      const stopper = playFullMusicTrack(
        track,
        (progress) => setTrackProgress(progress),
        () => {
          setPlayingTrackId(null);
          setTrackProgress(0);
        }
      );
      stopMusicRef.current = stopper;
    }
  };

  const handleQuickRemember = (text: string) => {
    onSaveMemory('Kullanıcı Notu', text.slice(0, 100));
    alert(t.rememberSuccess);
  };

  const DYNAMIC_GREETINGS: Record<AppLanguage, Array<{ title: string; subtitle: string; tag: string }>> = {
    tr: [
      {
        title: 'Bugün zihnindeki hangi fikri gerçeğe dönüştürmek istersin?',
        subtitle: 'GAME WORKS STUDIO yapay zeka motoru; 8K görsel, lo-fi müzik ve akıllı ders özetleriyle emrinde.',
        tag: 'Yaratıcı Zeka & Stüdyo',
      },
      {
        title: 'Işıklar hazır, nöral ağlar devrede. Ne keşfetmek istersin?',
        subtitle: 'Soru sor, ders notunu yükle, sesli komut ver veya yepyeni bir melodi bestele.',
        tag: 'Akıllı Asistan',
      },
      {
        title: 'Zihnindeki melodiyi besteleyelim mi, yoksa 8K bir sanat eseri mi çizelim?',
        subtitle: 'Yaratıcı stüdyolarımız ve akademik mantığımız tek bir dokunuş uzağında.',
        tag: 'Üretken Sanat & Müzik',
      },
      {
        title: 'Ders notların ve sınav hedeflerin burada güvende; birlikte çözelim.',
        subtitle: 'Saniyeler içinde interaktif sınav kartları, testler ve berrak özetler oluşturmaya hazır mısın?',
        tag: 'Akademik Asistan',
      },
      {
        title: 'GAME WORKS STUDIO yeni nesil AURA AI sistemine hoş geldin!',
        subtitle: 'Düşük gecikmeli bulut altyapısı, 256-bit uçtan uca şifreleme ve akıcı çok dilli deneyim parmaklarının ucunda.',
        tag: 'Resmi Sistem',
      },
      {
        title: 'Bugün hayal gücünün sınırlarını zorlamaya ne dersin?',
        subtitle: 'Foto-gerçekçi görseller, siberpunk manzaralar ve derin odaklanma ritimleri seni bekliyor.',
        tag: 'Sınırsız İlham',
      },
      {
        title: 'Kuantumdan sanata, sesten koda: Hangi alanda derinleşelim?',
        subtitle: 'Dosya yükleyebilir, mikrofonla konuşabilir veya karmaşık bir soruyu hemen yöneltebilirsin.',
        tag: 'Derin Nöral Analiz',
      },
      {
        title: 'Seni dinliyorum. Aklından geçen ilk şeyi bana söyle.',
        subtitle: 'Sesli komutları algılayıp uygulayan zeki asistanın her an görev başında.',
        tag: 'Sesli Asistan',
      },
    ],
    en: [
      {
        title: 'What brilliant idea would you like to bring to life today?',
        subtitle: 'GAME WORKS STUDIO generative engine is ready for 8K art, music, and smart study.',
        tag: 'Creative Studio',
      },
      {
        title: 'Neural networks active and ready. What shall we explore?',
        subtitle: 'Ask anything, upload documents, issue voice commands, or compose audio stems.',
        tag: 'Smart Dialogue',
      },
      {
        title: 'Shall we compose a soothing melody or render a futuristic masterpiece?',
        subtitle: 'Creative studios and academic reasoning at your fingertips.',
        tag: 'Generative Art',
      },
      {
        title: 'Welcome to AURA AI by GAME WORKS STUDIO!',
        subtitle: 'Next-gen intelligence, end-to-end security, and fluid multi-lingual interaction.',
        tag: 'Official Engine',
      },
    ],
    de: [
      {
        title: 'Welche Idee möchtest du heute in die Realität umsetzen?',
        subtitle: 'GAME WORKS STUDIO KI-Engine für 8K-Bilder, Lo-Fi-Musik und smarte Lernnotizen.',
        tag: 'Kreativstudio',
      },
      {
        title: 'Willkommen bei AURA AI von GAME WORKS STUDIO!',
        subtitle: 'Hochmoderne Intelligenz, Ende-zu-Ende-Verschlüsselung und intuitive Sprachsteuerung.',
        tag: 'Offizielles System',
      },
    ],
    es: [
      {
        title: '¿Qué gran idea te gustaría hacer realidad hoy?',
        subtitle: 'El motor de GAME WORKS STUDIO listo para arte 8K, música y resúmenes inteligentes.',
        tag: 'Estudio Creativo',
      },
      {
        title: '¡Bienvenido a AURA AI de GAME WORKS STUDIO!',
        subtitle: 'Inteligencia de próxima generación, seguridad cifrada y control de voz fluido.',
        tag: 'Sistema Oficial',
      },
    ],
    fr: [
      {
        title: 'Quelle idée brillante aimeriez-vous donner vie aujourd\'hui ?',
        subtitle: 'Le moteur de GAME WORKS STUDIO est prêt pour l\'art 8K, la musique et les études.',
        tag: 'Studio Créatif',
      },
      {
        title: 'Bienvenue sur AURA AI par GAME WORKS STUDIO !',
        subtitle: 'Intelligence de nouvelle génération, sécurité de bout en bout et commandes vocales.',
        tag: 'Système Officiel',
      },
    ],
  };

  const activeGreetingsList = DYNAMIC_GREETINGS[language] || DYNAMIC_GREETINGS.tr;
  const [greetingIndex, setGreetingIndex] = useState(() => Math.floor(Math.random() * (activeGreetingsList.length || 1)));
  const currentGreeting = activeGreetingsList[greetingIndex % activeGreetingsList.length] || activeGreetingsList[0];

  const handleShuffleGreeting = () => {
    setGreetingIndex((prev) => (prev + 1) % activeGreetingsList.length);
  };

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
      {/* Ambient Fluid Background Glows */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-aurora" />
      <div className="absolute bottom-16 right-1/4 w-80 h-80 bg-purple-500/15 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 right-12 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-float" />

      {/* Voice Action Notification Banner */}
      {voiceNotice && (
        <div className="relative z-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-bold py-2 px-4 text-center shadow-lg animate-in slide-in-from-top-2 duration-200 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
          <span>{voiceNotice}</span>
        </div>
      )}

      {/* Centered Circular AI Thinking Pulse Overlay with Soft In-Out Transitions */}
      <div
        className={`absolute inset-0 z-30 flex items-center justify-center p-4 transition-all duration-500 ease-in-out pointer-events-none ${
          isLoading
            ? 'opacity-100 backdrop-blur-[6px] bg-slate-950/20 dark:bg-slate-950/45 visible scale-100'
            : 'opacity-0 backdrop-blur-none bg-transparent invisible scale-90'
        }`}
      >
        <div className="relative flex flex-col items-center text-center max-w-sm w-full mx-auto px-6 py-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl backdrop-blur-2xl transition-transform duration-500">
          {/* Circular Pulse Ring Indicator */}
          <div className="relative flex items-center justify-center w-32 h-32 my-1">
            {/* Outermost Expanding Echo Ping */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${currentTheme.gradient} opacity-20 animate-ping duration-1000`} />

            {/* Glowing Diffused Radial Aura Halo */}
            <div className={`absolute -inset-4 rounded-full bg-gradient-to-tr ${currentTheme.gradient} opacity-30 blur-xl animate-pulse duration-700`} />

            {/* Orbiting Conic Gradient Tracer Ring */}
            <div className="absolute inset-2 rounded-full p-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500 animate-spin duration-3000">
              <div className="w-full h-full rounded-full bg-transparent" />
            </div>

            {/* Counter-rotating Dashed Ring */}
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin duration-8000 [animation-direction:reverse]" />

            {/* Concentric Sub-pulse Circle */}
            <div className="absolute inset-6 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 animate-pulse duration-500" />

            {/* Central Luminous Core Avatar with Floating Sparkles */}
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentTheme.gradient} p-[2px] shadow-xl shadow-indigo-500/50 flex items-center justify-center animate-bounce duration-1000`}>
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-300 animate-spin duration-3000" />
              </div>
            </div>
          </div>

          {/* Thinking Status & Micro-Copy */}
          <div className="mt-4 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-950/70 border border-indigo-500/20 text-indigo-600 dark:text-cyan-300 text-xs font-black tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>AURA AI DÜŞÜNÜYOR</span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 min-h-[38px] flex items-center justify-center px-2 leading-relaxed">
              {currentThinkingPhrases[thinkingStep % currentThinkingPhrases.length]}
            </p>

            {/* Real-time Subtitle & Badges */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1 text-indigo-500 dark:text-cyan-400 font-bold">
                <Zap className="w-3 h-3" />
                <span>Nöral Sentez</span>
              </span>
              <span>•</span>
              <span>Düşük Gecikme</span>
              <span>•</span>
              <span>256-Bit E2EE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          /* Empty State - Gemini Welcome with Dynamic Rotating Headline */
          <div className="h-full flex flex-col items-center justify-center py-8 sm:py-14 text-center animate-in fade-in zoom-in-95 duration-500">
            {/* Shimmering Multi-Ring Avatar */}
            <div className="relative mb-5 group cursor-pointer" onClick={handleShuffleGreeting}>
              <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full opacity-30 group-hover:opacity-60 blur-lg transition duration-700 group-hover:duration-200 animate-pulse-glow" />
              <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-tr ${currentTheme.gradient} p-[2px] shadow-2xl shadow-indigo-500/30 group-hover:scale-105 transition-all duration-300`}>
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-cyan-300 animate-float" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 animate-ping" />
            </div>

            {/* Maker Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-cyan-300 text-xs font-extrabold mb-3 shadow-sm backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5" />
              <span>GAME WORKS STUDIO</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] opacity-75 font-mono">{currentGreeting.tag}</span>
            </div>

            {/* Dynamic Center Title with Smooth Rotation & Shuffle Button */}
            <div className="relative max-w-xl px-4 flex flex-col items-center">
              <div
                key={greetingIndex}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center"
              >
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {currentGreeting.title}
                </h1>
                <p className="mt-3 text-xs sm:text-base text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                  {currentGreeting.subtitle}
                </p>
              </div>

              {/* Shuffle / Next Greeting Pill */}
              <button
                onClick={handleShuffleGreeting}
                title="Farklı bir ilham al (Yazıyı Değiştir)"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-300 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition shadow-sm active:scale-95"
              >
                <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-500" />
                <span>Yazıyı Değiştir / İlham Al</span>
              </button>
            </div>

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-7 w-full max-w-2xl text-left px-2">
              {[
                {
                  title: 'Ders Notu Özeti & Dosya Oku',
                  desc: 'Yapay Zeka ve Makine Öğrenimi temelleri özeti',
                  prompt: 'Bana Yapay Zeka, Derin Öğrenme ve Makine Öğrenmesi arasındaki farkları ders notu şeklinde açıkla, önemli terimleri öne çıkar.',
                  icon: BookOpen,
                  color: 'from-blue-500 to-indigo-600',
                },
                {
                  title: 'Ultra Kaliteli Görsel',
                  desc: 'Siberpunk İstanbul Boğazı görseli oluştur',
                  prompt: 'Siberpunk temalı, neon ışıklarla parlayan fütüristik bir İstanbul Boğazı köprüsü görseli üret.',
                  icon: ImageIcon,
                  color: 'from-fuchsia-500 to-pink-600',
                  mode: 'image' as const,
                },
                {
                  title: 'Müzik & Lo-Fi Beat',
                  desc: 'Odaklanma için sakin gece melodisi bestele',
                  prompt: 'Ders çalışırken dinlenebilecek, analog synthesizer ve sakin piyano akorlarından oluşan 85 BPM Lo-Fi bir parça bestele.',
                  icon: Music,
                  color: 'from-amber-500 to-orange-600',
                  mode: 'music' as const,
                },
                {
                  title: 'Yapımcın Kimdir?',
                  desc: 'GAME WORKS STUDIO hakkında bilgi ver',
                  prompt: 'Yapımcın kimdir, seni kim geliştirdi?',
                  icon: Building2,
                  color: 'from-purple-500 to-indigo-600',
                },
              ].map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (p.mode) setQuickMode(p.mode);
                      handleSend(p.prompt);
                    }}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-lg transition-all duration-200 group hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl text-white bg-gradient-to-br ${p.color} shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {p.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Message Feed */
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${
                  isUser ? 'justify-end' : 'justify-start'
                } animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${currentTheme.gradient} p-[1.5px] shadow-md flex-shrink-0 mt-1`}>
                    <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                    </div>
                  </div>
                )}

                {/* Message Content Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 shadow-sm transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-indigo-500/10'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                  }`}
                >
                  {/* Header info */}
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold tracking-wide ${isUser ? 'text-indigo-100' : 'text-indigo-600 dark:text-cyan-400'}`}>
                        {isUser ? 'Sen' : 'AURA AI • GAME WORKS STUDIO'}
                      </span>
                      {msg.latencyMs && (
                        <span className="text-[10px] font-mono opacity-60">
                          {msg.latencyMs}ms
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] opacity-60 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Attached Files in User Message */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 text-white text-xs border border-white/20"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{att.name}</span>
                          <span className="text-[10px] opacity-70">
                            ({(att.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Body Text (Guaranteed NO raw asterisks) */}
                  <div className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                    {msg.text}
                  </div>

                  {/* Memory Saved Banner if applicable */}
                  {!isUser && msg.rememberedMemory && (
                    <div className="mt-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2.5">
                      <Brain className="w-4 h-4 text-purple-400 flex-shrink-0 animate-pulse" />
                      <div className="text-xs">
                        <span className="font-bold text-purple-700 dark:text-purple-300">
                          Hafızaya Kaydedildi:
                        </span>{' '}
                        <span className="text-slate-700 dark:text-slate-300">
                          {msg.rememberedMemory.key}: {msg.rememberedMemory.value}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Key Highlights Card */}
                  {!isUser && msg.keyHighlights && msg.keyHighlights.length > 0 && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                        <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Kilit Çıkarımlar & Önemli Noktalar</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.keyHighlights.map((highlight, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-cyan-400 mt-1.5 flex-shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Study Insight Badge if any */}
                  {!isUser && msg.studyInsight && (
                    <div className="mt-3 p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-2.5">
                      <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                          Ders & Sınav İpucu
                        </span>
                        <p className="text-xs text-emerald-800 dark:text-emerald-200">
                          {msg.studyInsight}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Code Snippet Box */}
                  {!isUser && msg.codeSnippet && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 text-slate-100">
                      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-xs">
                        <span className="font-mono text-cyan-400">
                          {msg.codeSnippet.language || 'typescript'}
                        </span>
                        <button
                          onClick={() => handleCopy(`code_${msg.id}`, msg.codeSnippet!.code)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                        >
                          {copiedId === `code_${msg.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Kodu Kopyala</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3.5 text-xs font-mono overflow-x-auto text-slate-200 leading-relaxed">
                        <code>{msg.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Attached Generated Image */}
                  {msg.generatedImage && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group relative">
                      <img
                        src={msg.generatedImage}
                        alt="Aura AI Görseli"
                        className="w-full max-h-80 object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                        <span className="text-xs font-semibold text-white">8K Ultra HD Üretim</span>
                        <a
                          href={msg.generatedImage}
                          download="aura_ai_artwork.png"
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition flex items-center gap-1.5 text-xs font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>İndir</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Attached Music Player Card */}
                  {msg.generatedMusic && (
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleToggleMusicPlayback(msg.generatedMusic!)}
                            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 hover:scale-105 transition"
                          >
                            {playingTrackId === msg.generatedMusic.id ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5 ml-0.5" />
                            )}
                          </button>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {msg.generatedMusic.title}
                            </p>
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              {msg.generatedMusic.genre.toUpperCase()} • {msg.generatedMusic.bpm} BPM • {msg.generatedMusic.key}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          Canlı Synthesizer
                        </span>
                      </div>

                      {/* Progress bar */}
                      {playingTrackId === msg.generatedMusic.id && (
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-100"
                            style={{ width: `${trackProgress}%` }}
                          />
                        </div>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        {msg.generatedMusic.description}
                      </p>
                    </div>
                  )}

                  {/* Action suggestions chips */}
                  {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(action)}
                          className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-300 transition-all"
                        >
                          {action} →
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bottom Message Actions */}
                  {!isUser && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-slate-400">
                      <div className="flex items-center gap-1">
                        {/* TTS Audio */}
                        <button
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          title="Sesli Dinle"
                          className="p-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          {speakingId === msg.id ? (
                            <VolumeX className="w-4 h-4 text-indigo-600 dark:text-cyan-400 animate-pulse" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>

                        {/* Copy */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          title="Metni Kopyala"
                          className="p-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Save to Memory */}
                        <button
                          onClick={() => handleQuickRemember(msg.text)}
                          title="Hafızaya Ekle"
                          className="p-1.5 rounded-lg hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
                        >
                          <BrainCircuit className="w-4 h-4" />
                          <span className="hidden sm:inline">Hafızaya Yaz</span>
                        </button>

                        {/* Send to Study Summarizer */}
                        <button
                          onClick={() => onOpenStudySummarizerWithText(msg.text)}
                          title="Ders Özetleyiciye Gönder"
                          className="p-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-[11px]"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span className="hidden sm:inline">Özetle</span>
                        </button>
                      </div>

                      {/* Add to Calendar Event */}
                      <button
                        onClick={() => {
                          onAddEventToCalendar({
                            title: `Çalışma: ${msg.text.slice(0, 32)}...`,
                            description: msg.text,
                            date: new Date().toISOString().split('T')[0],
                            time: '18:00',
                            type: 'study',
                            completed: false,
                            priority: 'medium',
                          });
                          alert('Etkinlik takvime eklendi!');
                        }}
                        className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-cyan-400 hover:underline px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Takvime Ekle</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 animate-in fade-in">
            <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${currentTheme.gradient} p-[1.5px] shadow-md flex-shrink-0`}>
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              </div>
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-tl-sm flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping delay-150" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping delay-300" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                AURA AI bulut motoru yanıtı hazırlıyor...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-5 border-t border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Attached files preview chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1 pb-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 animate-in fade-in"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 text-slate-400 hover:text-rose-500 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick mode selector pill */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setQuickMode('standard')}
                className={`text-xs px-2.5 py-1 rounded-xl font-medium transition ${
                  quickMode === 'standard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                Normal Sohbet
              </button>
              <button
                onClick={() => setQuickMode('image')}
                className={`text-xs px-2.5 py-1 rounded-xl font-medium flex items-center gap-1 transition ${
                  quickMode === 'image'
                    ? 'bg-fuchsia-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Görsel Üret</span>
              </button>
              <button
                onClick={() => setQuickMode('music')}
                className={`text-xs px-2.5 py-1 rounded-xl font-medium flex items-center gap-1 transition ${
                  quickMode === 'music'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Müzik Bestele</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>GAME WORKS STUDIO</span>
            </div>
          </div>

          {/* Input Box */}
          <div className={`relative flex items-center rounded-2xl border transition-all ${
            isListening
              ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-lg shadow-rose-500/10'
              : 'border-slate-300 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
          } bg-slate-50 dark:bg-slate-900 p-1.5`}>
            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title={t.uploadFile}
              className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-white dark:hover:bg-slate-800 transition"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Voice Mic Button */}
            <button
              onClick={toggleVoiceRecording}
              title={isListening ? 'Dinlemeyi Durdur' : 'Sesli Komut Ver'}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input textarea */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isListening
                  ? t.listeningText
                  : attachments.length > 0
                  ? 'Dosya eklendi! Dosyayla ilgili soru sor veya özet iste...'
                  : quickMode === 'image'
                  ? 'Üretmek istediğin görseli tarif et (Örn: Siberpunk Galata Kulesi 8K)...'
                  : quickMode === 'music'
                  ? 'Bestelenecek müziğin temasını yaz (Örn: Yağmurlu gece Lo-Fi beat)...'
                  : t.inputPlaceholder
              }
              className="flex-1 bg-transparent border-0 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:hover:from-indigo-600 disabled:hover:to-purple-600 text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
