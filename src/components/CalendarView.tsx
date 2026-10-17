import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Bell, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onAddEvent,
  onToggleComplete,
  onDeleteEvent,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [type, setType] = useState<'study' | 'exam' | 'reminder' | 'project'>('study');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      type,
      priority,
      completed: false,
    });

    setTitle('');
    setDescription('');
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        alert('Tebrikler! Tarayıcı bildirimleri başarıyla etkinleştirildi.');
        new Notification('AURA AI Takvim', {
          body: 'Ders ve sınav hatırlatıcıların artık anlık olarak iletilecek.',
          icon: '/favicon.ico',
        });
      } else {
        alert('Bildirim izni verilmedi.');
      }
    } else {
      alert('Tarayıcınız bildirim özelliğini desteklemiyor.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Gelişmiş Takvim & Bildirim Yönetimi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Yapay zeka çalışma planı, sınav tarihleri ve akıllı bildirimler tek bir takvimde.
            </p>
          </div>
        </div>

        <button
          onClick={requestNotificationPermission}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700"
        >
          <Bell className="w-4 h-4 text-rose-500" />
          <span>Bildirim İznini Etkinleştir</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Add Event Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-500" />
              <span>Yeni Etkinlik / Ders Planla</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Kuantum Fiziği Sınav Tekrarı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Açıklama / Not
                </label>
                <textarea
                  rows={2}
                  placeholder="Çalışılacak konular veya sınav detayları..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Saat
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Tür
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="study">📚 Ders Tekrarı</option>
                    <option value="exam">🎯 Sınav</option>
                    <option value="project">💻 Proje</option>
                    <option value="reminder">🔔 Hatırlatıcı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Öncelik
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek (Kritik)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition hover:scale-102"
              >
                Takvime Kaydet & Bildirim Kur
              </button>
            </form>
          </div>
        </div>

        {/* Right: Events List & Filters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Planlanmış Etkinlikler ({filteredEvents.length})
              </span>

              {/* Filter Tabs */}
              <div className="flex gap-1">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'study', label: 'Dersler' },
                  { id: 'exam', label: 'Sınavlar' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                      filterType === f.id
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bu kategoride planlanmış etkinlik bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      event.completed
                        ? 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleComplete(event.id)}
                        className={`mt-0.5 transition ${
                          event.completed
                            ? 'text-emerald-500'
                            : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold ${event.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {event.title}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            event.priority === 'high'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {event.type.toUpperCase()}
                          </span>
                        </div>

                        {event.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {event.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{event.date} • {event.time}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      title="Sil"
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
