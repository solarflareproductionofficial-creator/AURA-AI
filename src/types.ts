export type AppTab = 
  | 'chat'
  | 'image_studio'
  | 'music_studio'
  | 'study_summarizer'
  | 'dashboard'
  | 'learning_engine'
  | 'calendar'
  | 'vault';

export type AppLanguage = 'tr' | 'en' | 'de' | 'es' | 'fr';

export type AccentTheme = 'nebula' | 'cyberpunk' | 'midnight' | 'sunset' | 'emerald';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  base64?: string;
  isImage: boolean;
}

export interface CodeSnippet {
  language: string;
  code: string;
  title?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  latencyMs?: number;
  keyHighlights?: string[];
  suggestedActions?: string[];
  category?: 'study' | 'creative' | 'code' | 'general' | 'music' | 'image';
  codeSnippet?: CodeSnippet | null;
  studyInsight?: string;
  generatedImage?: string;
  generatedMusic?: MusicTrack;
  encrypted?: boolean;
  rememberedMemory?: { key: string; value: string } | null;
  attachments?: AttachedFile[];
}

export interface Flashcard {
  question: string;
  answer: string;
  difficulty: 'Kolay' | 'Orta' | 'İleri';
  mastered?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CoreConcept {
  name: string;
  description: string;
}

export interface StudySummary {
  id: string;
  summaryTitle: string;
  subject: string;
  executiveSummary: string;
  coreConcepts: CoreConcept[];
  keyTakeaways: string[];
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  memoryAids: string[];
  estimatedStudyTimeMinutes: number;
  dateCreated: string;
}

export interface ChordItem {
  name: string;
  notes: number[];
  duration: number;
}

export interface MelodyNote {
  frequency: number;
  time: number;
  duration: number;
  note: string;
}

export interface DrumPattern {
  kickTimes: number[];
  snareTimes: number[];
  hihatTimes: number[];
}

export interface MusicTrack {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  key: string;
  mood: string;
  description: string;
  lyrics?: string;
  chords: ChordItem[];
  leadMelody: MelodyNote[];
  drumPattern: DrumPattern;
  synthPreset: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'study' | 'exam' | 'reminder' | 'project';
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface MemoryVector {
  id: string;
  category: 'tone' | 'interest' | 'language' | 'study_field' | 'music_taste';
  key: string;
  value: string;
  weight: number; // 0 to 1
  lastUpdated: string;
}

export interface SystemMetrics {
  cloudRegion: string;
  scalingStatus: string;
  avgLatencyMs: number;
  p99LatencyMs: number;
  e2eeStatus: string;
  totalTokensProcessed: number;
  neuralWeightsVersion: string;
  activeSubscribers: number;
  memoryVectorsTrained: number;
  uptimePercent: number;
  lastLearningCycle: string;
}
