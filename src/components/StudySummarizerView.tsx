import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  CalendarPlus, 
  Copy, 
  Check, 
  RotateCw, 
  Brain, 
  Clock, 
  FileText,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { StudySummary, Flashcard, QuizQuestion, CalendarEvent } from '../types';

interface StudySummarizerViewProps {
  initialText?: string;
  onAddEventToCalendar: (event: Omit<CalendarEvent, 'id'>) => void;
}

export const StudySummarizerView: React.FC<StudySummarizerViewProps> = ({
  initialText = '',
  onAddEventToCalendar,
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [title, setTitle] = useState('Veri Yapıları & Algoritmalar');
  const [subject, setSubject] = useState('Bilgisayar Mühendisliği');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<StudySummary | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz' | 'mnemonics'>('summary');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardsState, setFlashcardsState] = useState<Flashcard[]>([]);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const presets = [
    {
      title: 'Yapay Sinir Ağları ve Derin Öğrenme',
      subject: 'Yapay Zeka',
      text: `Yapay Sinir Ağları (YSA), insan beyninin biyolojik nöron yapısından esinlenerek geliştirilmiş matematiksel modellerdir. Bir YSA temel olarak girdi katmanı, bir veya birden fazla gizli katman ve çıktı katmanından oluşur. Her bağlantı bir ağırlık (weight) değerine ve her nöron bir eşik (bias) değerine sahiptir. Öğrenme süreci, ağın tahmin ettiği çıktı ile gerçek çıktı arasındaki hatayı ölçen kayıp fonksiyonunun (loss function) geriye yayılım (backpropagation) algoritması ve gradyan inişi (gradient descent) optimizasyonu yardımıyla minimize edilmesi prensibine dayanır. Aşırı öğrenmeyi (overfitting) engellemek için Dropout, L1/L2 regülarizasyonu ve Erken Durdurma (Early Stopping) yöntemleri uygulanır. Modern derin ağlar olan Transformatörler (Transformer) ise Dikkat Mekanizması (Self-Attention) sayesinde metin ve sekans verilerinde çığır açmıştır.`,
    },
    {
      title: 'Kuantum Fiziği ve Süperpozisyon',
      subject: 'Fizik & Kimya',
      text: `Kuantum mekaniği, mikroskobik ölçekteki atom altı parçacıkların davranışlarını inceler. Temel ilkelerden ilki dalga-parçacık ikiliğidir (Wave-Particle Duality); fotonlar ve elektronlar hem dalga hem parçacık gibi davranabilir. İkinci kilit prensip Heisenberg Belirsizlik İlkesidir: Bir parçacığın konumu ve momentumu aynı anda mutlak kesinlikle bilinemez. Üçüncü prensip ise Kuantum Süperpozisyonudur: Bir kuantum sistemi gözlemlenene kadar olası tüm durumlarda eşzamanlı olarak bulunur; Schrödinger'in Kedisi deneyi bu ilkenin paradoksal bir metaforudur. Kuantum Dolanıklık (Quantum Entanglement) durumunda ise parçacıklar aralarındaki mesafeden bağımsız olarak birbirlerinin durumunu anında etkiler.`,
    },
    {
      title: 'İşletim Sistemleri: Sanal Bellek ve Sayfalama',
      subject: 'Sistem Mimarisi',
      text: `Sanal bellek (Virtual Memory), fiziksel RAM kapasitesinden daha büyük programların kesintisiz çalışabilmesini sağlayan bir bellek yönetimi tekniğidir. Bellek, sabit boyutlu 'sayfalara' (pages) ve fiziksel bellek ise aynı boyutlu 'çerçevelere' (frames) bölünür. Sayfa Tablosu (Page Table), sanal adresleri fiziksel adreslere dönüştürmekle görevlidir. İstenen sayfa RAM'de bulunmadığında Sayfa Hatası (Page Fault) kesmesi üretilir ve diskten takas alanı (swap space) kullanılarak yüklenir. Sayfa değiştirme algoritmalarında LRU (En Son Kullanılan) ve FIFO yaygın olarak kullanılır. Aşırı sayfa değişimi durumunda sistem 'thrashing' evresine girer ve işlemci performansı düşer.`,
    },
  ];

  const handleGenerateSummary = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/summarize-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          title,
          subject,
          format: 'full',
        }),
      });

      if (!response.ok) {
        throw new Error('Özetleme başarısız oldu');
      }

      const data: StudySummary = await response.json();
      setSummaryData(data);
      setFlashcardsState(data.flashcards || []);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setSelectedAnswers({});
      setShowQuizResults(false);
    } catch (err) {
      console.error(err);
      alert('Özet oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleReview = () => {
    if (!summaryData) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    onAddEventToCalendar({
      title: `Tekrar: ${summaryData.summaryTitle}`,
      description: `${summaryData.subject} dersi özet ve soru tekrarı (${summaryData.estimatedStudyTimeMinutes} dk)`,
      date: tomorrow.toISOString().split('T')[0],
      time: '19:30',
      type: 'study',
      completed: false,
      priority: 'high',
    });

    alert('Ders tekrar oturumu yarın saat 19:30 için takvime eklendi!');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Akıllı Ders & Not Özetleyici
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Notlarını ve ders metinlerini Gemini ile interaktif sınav kartlarına, sınav sorularına ve berrak özetlere dönüştür.
            </p>
          </div>
        </div>

        {summaryData && (
          <button
            onClick={handleScheduleReview}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-105 transition"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Takvime Tekrar Ekle</span>
          </button>
        )}
      </div>

      {/* Input Section */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hızlı Hazır Ders Şablonları
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTitle(p.title);
                  setSubject(p.subject);
                  setInputText(p.text);
                }}
                className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 transition font-medium"
              >
                {p.title.split(' ')[0]} {p.title.split(' ')[1] || ''}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Ders / Konu Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Örn: Organik Kimya Fonksiyonel Gruplar"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Alan / Kategori
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Örn: Fen Bilimleri / Tıp"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Ders Notu / Makale / Kitap Metni
          </label>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ders notunu, slayt metinlerini veya özetlenmesini istediğin bilgileri buraya yapıştır..."
            className="w-full p-3.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerateSummary}
            disabled={!inputText.trim() || isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 shadow-lg shadow-emerald-500/25 transition-all hover:scale-102"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Analiz Ediliyor & Kartlar Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Özeti ve Sınav Kartlarını Oluştur</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Workspace */}
      {summaryData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Sub Navigation */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'summary'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Yönetici Özeti</span>
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'flashcards'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Sınav Çalışma Kartları ({summaryData.flashcards?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'quiz'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>İnteraktif Test ({summaryData.quizQuestions?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('mnemonics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'mnemonics'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Mnemonic & Hafıza İpuçları</span>
            </button>
          </div>

          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {/* Executive Summary Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {summaryData.subject}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {summaryData.summaryTitle}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{summaryData.estimatedStudyTimeMinutes} dk çalışma süresi</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
                  {summaryData.executiveSummary}
                </p>

                {/* Key Takeaways */}
                {summaryData.keyTakeaways && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                      Kritik Ders Çıkarımları
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {summaryData.keyTakeaways.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Core Concepts */}
              {summaryData.coreConcepts && summaryData.coreConcepts.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-500" />
                    <span>Temel Kavramlar & Tanımlar</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {summaryData.coreConcepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5"
                      >
                        <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                          {concept.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {concept.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERACTIVE FLASHCARDS */}
          {activeTab === 'flashcards' && flashcardsState.length > 0 && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-between w-full max-w-md text-xs font-semibold text-slate-500">
                <span>Kart {currentCardIndex + 1} / {flashcardsState.length}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {flashcardsState[currentCardIndex].difficulty}
                </span>
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-md h-64 rounded-3xl p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/5 cursor-pointer select-none flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {isFlipped ? 'Cevap' : 'Soru (Tıkla ve Çevir)'}
                  </span>
                  <RotateCw className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex-1 flex items-center justify-center text-center py-4">
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {isFlipped
                      ? flashcardsState[currentCardIndex].answer
                      : flashcardsState[currentCardIndex].question}
                  </p>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  {isFlipped ? 'Geri çevirmek için tıkla' : 'Cevabı görmek için karta dokun'}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcardsState.length - 1));
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                >
                  ← Önceki Kart
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev < flashcardsState.length - 1 ? prev + 1 : 0));
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-md shadow-emerald-500/20"
                >
                  Sonraki Kart →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QUIZ TEST */}
          {activeTab === 'quiz' && summaryData.quizQuestions && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sınav Pratiği: Bilgini Sına
                </h3>
                <span className="text-xs text-slate-400">
                  {summaryData.quizQuestions.length} Çoktan Seçmeli Soru
                </span>
              </div>

              <div className="space-y-6">
                {summaryData.quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === oIdx;
                        const isCorrect = showQuizResults && q.correctIndex === oIdx;
                        const isWrong = showQuizResults && isSelected && q.correctIndex !== oIdx;

                        return (
                          <button
                            key={oIdx}
                            disabled={showQuizResults}
                            onClick={() => {
                              setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
                            }}
                            className={`p-3 rounded-2xl text-left text-xs font-medium border transition-all ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                                : isWrong
                                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-200'
                                : isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                                : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                            }`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)})</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {showQuizResults && (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Çözüm İzahı: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowQuizResults(!showQuizResults)}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition"
                >
                  {showQuizResults ? 'Sonuçları Gizle / Tekrar Çöz' : 'Cevapları Kontrol Et'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MNEMONICS */}
          {activeTab === 'mnemonics' && summaryData.memoryAids && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Akılda Kalıcı Kodlamalar ve Benzetmeler</span>
              </h3>
              <div className="space-y-2">
                {summaryData.memoryAids.map((aid, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-3"
                  >
                    <span className="text-base">💡</span>
                    <p className="leading-relaxed">{aid}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
