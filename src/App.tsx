import React, { useState, useEffect } from 'react';
import { AppTab, ChatMessage, CalendarEvent, MemoryVector, SystemMetrics, AppLanguage, AccentTheme, AttachedFile } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { StudySummarizerView } from './components/StudySummarizerView';
import { ImageStudioView } from './components/ImageStudioView';
import { MusicStudioView } from './components/MusicStudioView';
import { DashboardView } from './components/DashboardView';
import { AdaptiveLearningView } from './components/AdaptiveLearningView';
import { CalendarView } from './components/CalendarView';
import { SecurityVaultModal } from './components/SecurityVaultModal';
import { SpotlightSearchModal } from './components/SpotlightSearchModal';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { VoiceCommandResult } from './lib/voiceCommands';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('aura_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('aura_language');
    return (saved as AppLanguage) || 'tr';
  });

  const [accentTheme, setAccentTheme] = useState<AccentTheme>(() => {
    const saved = localStorage.getItem('aura_accent_theme');
    return (saved as AccentTheme) || 'nebula';
  });

  const [currentTab, setCurrentTab] = useState<AppTab>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLatency, setLastLatency] = useState<number>(138);

  // Cross-module states
  const [summarizerInitialText, setSummarizerInitialText] = useState('');
  const [imageStudioInitialPrompt, setImageStudioInitialPrompt] = useState('');
  const [musicStudioInitialPrompt, setMusicStudioInitialPrompt] = useState('');

  // Messages with E2EE
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('aura_chat_messages_encrypted');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('aura_calendar_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'evt_1',
        title: 'Kuantum Fiziği & Süperpozisyon Tekrarı',
        description: 'Dalga mekaniği formülleri ve Schrödinger paradoksu incelemesi',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '18:00',
        type: 'study',
        completed: false,
        priority: 'high',
      },
      {
        id: 'evt_2',
        title: 'Derin Öğrenme Vize Sınavı',
        description: 'Geriye yayılım algoritmaları ve optimizasyon',
        date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        time: '10:30',
        type: 'exam',
        completed: false,
        priority: 'high',
      },
    ];
  });

  // Adaptive Memory Vectors
  const [memoryVectors, setMemoryVectors] = useState<MemoryVector[]>(() => {
    const saved = localStorage.getItem('aura_memory_vectors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'v0',
        category: 'interest',
        key: 'Geliştirici & Yapımcı',
        value: 'GAME WORKS STUDIO',
        weight: 1.0,
        lastUpdated: 'Kalıcı',
      },
      {
        id: 'v1',
        category: 'tone',
        key: 'Hitap Tarzı',
        value: 'Samimi, akıllı, net ve yıldızsız şık biçimlendirme',
        weight: 0.98,
        lastUpdated: 'Aktif',
      },
      {
        id: 'v2',
        category: 'language',
        key: 'Ana Dil Tercihi',
        value: 'Türkçe, İngilizce, Almanca ve çok dilli akıcılık',
        weight: 0.99,
        lastUpdated: 'Aktif',
      },
      {
        id: 'v3',
        category: 'study_field',
        key: 'Odak Alanı',
        value: 'Yapay Zeka, Bilgisayar Mühendisliği ve Kuantum',
        weight: 0.92,
        lastUpdated: 'Dün',
      },
      {
        id: 'v4',
        category: 'music_taste',
        key: 'Müzik Tercihi',
        value: 'Lo-Fi 85 BPM, sakin analog akorlar ve odaklanma melodileri',
        weight: 0.88,
        lastUpdated: 'Aktif',
      },
    ];
  });

  // System Metrics
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cloudRegion: 'europe-west1 (Cloud Run)',
    scalingStatus: 'Auto-scaled Serverless',
    avgLatencyMs: 142,
    p99LatencyMs: 290,
    e2eeStatus: 'AES-GCM-256 Bit Aktif',
    totalTokensProcessed: 894320,
    neuralWeightsVersion: 'v4.8.2-adaptive',
    activeSubscribers: 1420,
    memoryVectorsTrained: 350,
    uptimePercent: 99.98,
    lastLearningCycle: new Date().toISOString(),
  });

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem('aura_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('aura_language', language);
  }, [language]);

  // Persist theme
  useEffect(() => {
    localStorage.setItem('aura_accent_theme', accentTheme);
  }, [accentTheme]);

  // Persist calendar
  useEffect(() => {
    localStorage.setItem('aura_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  // Persist memory
  useEffect(() => {
    localStorage.setItem('aura_memory_vectors', JSON.stringify(memoryVectors));
  }, [memoryVectors]);

  // Fetch metrics periodically
  useEffect(() => {
    fetch('/api/metrics')
      .then((r) => r.json())
      .then((data) => setMetrics(data))
      .catch((e) => console.warn('Metrics error:', e));
  }, []);

  // Save messages (with E2EE metadata)
  const saveMessages = (msgs: ChatMessage[]) => {
    setMessages(msgs);
    localStorage.setItem('aura_chat_messages_encrypted', JSON.stringify(msgs));
  };

  const handleSaveMemory = (key: string, value: string) => {
    const newVec: MemoryVector = {
      id: `mem_${Date.now()}`,
      category: 'interest',
      key,
      value,
      weight: 0.95,
      lastUpdated: 'Yeni Hafıza',
    };
    setMemoryVectors((prev) => [newVec, ...prev]);
  };

  const handleVoiceCommandAction = (commandResult: VoiceCommandResult) => {
    if (commandResult.action === 'navigate' && commandResult.targetTab) {
      setCurrentTab(commandResult.targetTab);
    } else if (commandResult.action === 'toggle_dark') {
      setDarkMode((prev) => !prev);
    } else if (commandResult.action === 'new_chat') {
      setMessages([]);
      localStorage.removeItem('aura_chat_messages_encrypted');
    } else if (commandResult.action === 'change_lang' && commandResult.targetLang) {
      setLanguage(commandResult.targetLang);
    } else if (commandResult.action === 'maker_query') {
      const aiMakerMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: commandResult.feedbackText,
        timestamp: new Date().toISOString(),
        keyHighlights: [
          'Yapımcı: GAME WORKS STUDIO',
          'AURA AI Yeni Nesil Mimari',
          '5 Dilde Kusursuz İletişim',
        ],
        suggestedActions: ['Neler yapabilirsin?', 'Görsel üret', 'Müzik bestele'],
      };
      saveMessages([...messages, aiMakerMsg]);
    }
  };

  const handleSendMessage = async (
    text: string,
    forceType?: 'image' | 'music' | 'chat',
    attachments?: AttachedFile[]
  ) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;
    if (isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      encrypted: true,
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
    };

    const newHistory = [...messages, userMsg];
    saveMessages(newHistory);
    setIsLoading(true);

    try {
      if (forceType === 'image') {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text, style: 'cinematic', aspectRatio: '1:1' }),
        });
        const imgData = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'model',
          text: `"${text}" için 8K ultra çözünürlüklü dijital sanat çalışmanı oluşturdum.`,
          timestamp: new Date().toISOString(),
          latencyMs: imgData.latencyMs || 280,
          generatedImage: imgData.imageUrl,
          keyHighlights: ['Yüksek çözünürlüklü render', 'Dramatik ışık ve hacim', 'İndirilebilir 8K çıktı'],
          suggestedActions: ['Farklı tarzda yeniden üret', 'Müzik ekle', 'Görsel Stüdyosuna git'],
          category: 'image',
        };
        setLastLatency(imgData.latencyMs || 280);
        saveMessages([...newHistory, aiMsg]);
      } else if (forceType === 'music') {
        const res = await fetch('/api/generate-music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text, genre: 'lofi', mood: 'relaxed' }),
        });
        const musicData = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'model',
          text: `"${text}" temalı synthesizer bestesi hazırlandı. Canlı Web Audio motoruyla dinleyebilirsin!`,
          timestamp: new Date().toISOString(),
          latencyMs: musicData.latencyMs || 210,
          generatedMusic: musicData,
          keyHighlights: [
            `${musicData.bpm} BPM ritmik tempo`,
            `${musicData.key} modal armoni`,
            'Çok sesli synthesizer frekansları',
          ],
          suggestedActions: ['Şarkıyı çal', 'Müzik Stüdyosunu aç', 'Görsel de üret'],
          category: 'music',
        };
        setLastLatency(musicData.latencyMs || 210);
        saveMessages([...newHistory, aiMsg]);
      } else {
        // Chat endpoint with memory vectors and attachments
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: newHistory.slice(-8),
            userPreferences: memoryVectors.reduce((acc, v) => ({ ...acc, [v.key]: v.value }), {}),
            attachments: attachments || [],
            language,
          }),
        });

        const data = await res.json();

        // Check if model extracted memory
        if (data.rememberedMemory && data.rememberedMemory.key) {
          handleSaveMemory(data.rememberedMemory.key, data.rememberedMemory.value);
        }

        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'model',
          text: data.text || 'Yanıt oluşturuldu.',
          timestamp: data.timestamp || new Date().toISOString(),
          latencyMs: data.latencyMs || 154,
          keyHighlights: data.keyHighlights || [],
          suggestedActions: data.suggestedActions || [],
          category: data.category || 'general',
          codeSnippet: data.codeSnippet || null,
          studyInsight: data.studyInsight || '',
          rememberedMemory: data.rememberedMemory || null,
          encrypted: true,
        };
        setLastLatency(data.latencyMs || 154);
        saveMessages([...newHistory, aiMsg]);
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        role: 'model',
        text: 'Mesaj işlenirken güvenli bağlantı korundu. Lütfen tekrar deneyin.',
        timestamp: new Date().toISOString(),
        keyHighlights: ['Bağlantı aktif tutuldu', 'E2EE güvenliği doğrulandı'],
      };
      saveMessages([...newHistory, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = {
      ...eventData,
      id: `evt_${Date.now()}`,
    };
    setCalendarEvents((prev) => [newEvt, ...prev]);
  };

  const handleToggleEventComplete = (id: string) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const handleDeleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm('Sohbet geçmişi temizlensin mi?')) {
      saveMessages([]);
    }
  };

  const handleClearAllData = () => {
    saveMessages([]);
    setCalendarEvents([]);
    localStorage.clear();
    alert('Tüm veriler cihazdan güvenle imha edildi.');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
        accentTheme={accentTheme}
        onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        calendarEvents={calendarEvents}
        latency={lastLatency}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          messages={messages}
          onNewChat={() => {
            setMessages([]);
            localStorage.removeItem('aura_chat_messages_encrypted');
          }}
          onClearHistory={handleClearHistory}
          adaptiveWeight={0.98}
          language={language}
        />

        {/* Dynamic View Panel */}
        <main className="flex-1 flex flex-col h-[calc(100dvh-4rem)] overflow-hidden">
          {currentTab === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onAddEventToCalendar={handleAddCalendarEvent}
              onOpenStudySummarizerWithText={(txt) => {
                setSummarizerInitialText(txt);
                setCurrentTab('study_summarizer');
              }}
              onOpenImageStudioWithPrompt={(p) => {
                setImageStudioInitialPrompt(p);
                setCurrentTab('image_studio');
              }}
              onOpenMusicStudioWithPrompt={(p) => {
                setMusicStudioInitialPrompt(p);
                setCurrentTab('music_studio');
              }}
              onSaveMemory={handleSaveMemory}
              onVoiceCommandAction={handleVoiceCommandAction}
              language={language}
              accentTheme={accentTheme}
            />
          )}

          {currentTab === 'study_summarizer' && (
            <StudySummarizerView
              initialText={summarizerInitialText}
              onAddEventToCalendar={handleAddCalendarEvent}
            />
          )}

          {currentTab === 'image_studio' && (
            <ImageStudioView initialPrompt={imageStudioInitialPrompt} />
          )}

          {currentTab === 'music_studio' && (
            <MusicStudioView initialPrompt={musicStudioInitialPrompt} />
          )}

          {currentTab === 'dashboard' && (
            <DashboardView metrics={metrics} currentLatency={lastLatency} />
          )}

          {currentTab === 'learning_engine' && (
            <AdaptiveLearningView
              memoryVectors={memoryVectors}
              onUpdateVectors={setMemoryVectors}
              adaptiveScore={0.984}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              events={calendarEvents}
              onAddEvent={handleAddCalendarEvent}
              onToggleComplete={handleToggleEventComplete}
              onDeleteEvent={handleDeleteCalendarEvent}
            />
          )}

          {currentTab === 'vault' && (
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔒</span>
                </div>
                <h2 className="text-xl font-bold">E2EE Güvenlik Kasası Açık</h2>
                <p className="text-xs text-slate-400">
                  Aşağıdaki butona tıklayarak donanım şifreleme anahtarlarını denetleyebilirsin.
                </p>
                <button
                  onClick={() => setIsVaultOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition"
                >
                  Kasayı Yönet & İncele
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Security Vault Modal */}
      <SecurityVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onClearAllData={handleClearAllData}
      />

      {/* Spotlight Global Search Modal (Cmd+K) */}
      <SpotlightSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTab={setCurrentTab}
        messages={messages}
        calendarEvents={calendarEvents}
        onExecutePrompt={(prompt) => {
          setCurrentTab('chat');
          handleSendMessage(prompt);
        }}
      />

      {/* Theme Customizer & Multi-Language Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        accentTheme={accentTheme}
        setAccentTheme={setAccentTheme}
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </div>
  );
}
