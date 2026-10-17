import { AppTab, AppLanguage } from '../types';

export interface VoiceCommandResult {
  isCommand: boolean;
  action?: 'navigate' | 'toggle_dark' | 'new_chat' | 'change_lang' | 'maker_query' | 'remember_query';
  targetTab?: AppTab;
  targetLang?: AppLanguage;
  feedbackText: string;
}

export function parseVoiceCommand(transcript: string, currentLang: AppLanguage): VoiceCommandResult {
  const text = transcript.toLowerCase().trim();

  // 1. Who made you / Maker query
  if (
    text.includes('yapımcı') ||
    text.includes('kim yaptı') ||
    text.includes('geliştirici') ||
    text.includes('who made') ||
    text.includes('who created') ||
    text.includes('wer hat') ||
    text.includes('quién te') ||
    text.includes('qui t\'a')
  ) {
    const feedback = currentLang === 'en'
      ? 'I was created and developed by GAME WORKS STUDIO.'
      : currentLang === 'de'
      ? 'Ich wurde von GAME WORKS STUDIO entwickelt.'
      : currentLang === 'es'
      ? 'Fui desarrollado por GAME WORKS STUDIO.'
      : currentLang === 'fr'
      ? 'J\'ai été développé par GAME WORKS STUDIO.'
      : 'Ben GAME WORKS STUDIO tarafından geliştirilmiş yeni nesil AURA AI akıllı asistanıyım.';

    return {
      isCommand: true,
      action: 'maker_query',
      feedbackText: feedback,
    };
  }

  // 2. Navigation commands
  if (
    text.includes('müzik stüdyo') ||
    text.includes('şarkı yap') ||
    text.includes('müzik aç') ||
    text.includes('music studio') ||
    text.includes('open music') ||
    text.includes('musikstudio')
  ) {
    return {
      isCommand: true,
      action: 'navigate',
      targetTab: 'music_studio',
      feedbackText: currentLang === 'en' ? 'Opening Music Studio...' : 'Müzik ve Synth Stüdyosu açılıyor...',
    };
  }

  if (
    text.includes('görsel stüdyo') ||
    text.includes('fotoğraf üret') ||
    text.includes('resim yap') ||
    text.includes('image studio') ||
    text.includes('open image') ||
    text.includes('bild-studio')
  ) {
    return {
      isCommand: true,
      action: 'navigate',
      targetTab: 'image_studio',
      feedbackText: currentLang === 'en' ? 'Opening Image Studio...' : 'Görsel ve Fotoğraf Stüdyosu açılıyor...',
    };
  }

  if (
    text.includes('ders özet') ||
    text.includes('sınav kart') ||
    text.includes('not özetle') ||
    text.includes('study summarizer') ||
    text.includes('lernzusammenfassung')
  ) {
    return {
      isCommand: true,
      action: 'navigate',
      targetTab: 'study_summarizer',
      feedbackText: currentLang === 'en' ? 'Opening Study Summarizer...' : 'Akıllı Ders ve Not Özetleyici açılıyor...',
    };
  }

  if (
    text.includes('panel') ||
    text.includes('metrik') ||
    text.includes('gecikme') ||
    text.includes('dashboard') ||
    text.includes('performance')
  ) {
    return {
      isCommand: true,
      action: 'navigate',
      targetTab: 'dashboard',
      feedbackText: currentLang === 'en' ? 'Opening Performance Dashboard...' : 'Performans ve Bulut Paneli açılıyor...',
    };
  }

  if (
    text.includes('takvim') ||
    text.includes('hatırlat') ||
    text.includes('calendar') ||
    text.includes('kalender')
  ) {
    return {
      isCommand: true,
      action: 'navigate',
      targetTab: 'calendar',
      feedbackText: currentLang === 'en' ? 'Opening Calendar...' : 'Takvim ve Bildirimler açılıyor...',
    };
  }

  if (
    text.includes('hafıza') ||
    text.includes('öğrenme motoru') ||
    text.includes('memory') ||
    text.includes('gedächtnis')
  ) {
    return {
      isCommand: true,
      action: 'navigate',
      targetTab: 'learning_engine',
      feedbackText: currentLang === 'en' ? 'Opening Adaptive Memory Engine...' : 'Adaptif Öğrenme Hafızası açılıyor...',
    };
  }

  if (
    text.includes('güvenlik kasa') ||
    text.includes('şifreleme') ||
    text.includes('vault') ||
    text.includes('tresor')
  ) {
    return {
      isCommand: true,
      action: 'navigate',
      targetTab: 'vault',
      feedbackText: currentLang === 'en' ? 'Opening E2EE Security Vault...' : 'E2EE Güvenlik Kasası açılıyor...',
    };
  }

  // 3. Theme toggle command
  if (
    text.includes('karanlık mod') ||
    text.includes('gece modu') ||
    text.includes('aydınlık mod') ||
    text.includes('dark mode') ||
    text.includes('light mode') ||
    text.includes('dunkelmodus')
  ) {
    return {
      isCommand: true,
      action: 'toggle_dark',
      feedbackText: currentLang === 'en' ? 'Toggling theme mode...' : 'Tema modu değiştirildi.',
    };
  }

  // 4. New chat command
  if (
    text.includes('yeni sohbet') ||
    text.includes('sohbeti temizle') ||
    text.includes('new chat') ||
    text.includes('clear chat') ||
    text.includes('neuer chat')
  ) {
    return {
      isCommand: true,
      action: 'new_chat',
      targetTab: 'chat',
      feedbackText: currentLang === 'en' ? 'Starting a new chat session...' : 'Yeni sohbet oturumu başlatıldı.',
    };
  }

  // 5. Language switch commands
  if (text.includes('türkçe') || text.includes('switch to turkish')) {
    return {
      isCommand: true,
      action: 'change_lang',
      targetLang: 'tr',
      feedbackText: 'Dil Türkçe olarak ayarlandı.',
    };
  }
  if (text.includes('english') || text.includes('ingilizceye geç') || text.includes('auf englisch')) {
    return {
      isCommand: true,
      action: 'change_lang',
      targetLang: 'en',
      feedbackText: 'Language switched to English.',
    };
  }
  if (text.includes('deutsch') || text.includes('almancaya geç') || text.includes('german')) {
    return {
      isCommand: true,
      action: 'change_lang',
      targetLang: 'de',
      feedbackText: 'Sprache auf Deutsch umgestellt.',
    };
  }
  if (text.includes('español') || text.includes('ispanyolca') || text.includes('spanish')) {
    return {
      isCommand: true,
      action: 'change_lang',
      targetLang: 'es',
      feedbackText: 'Idioma cambiado a español.',
    };
  }
  if (text.includes('français') || text.includes('fransızca') || text.includes('french')) {
    return {
      isCommand: true,
      action: 'change_lang',
      targetLang: 'fr',
      feedbackText: 'Langue changée en français.',
    };
  }

  return {
    isCommand: false,
    feedbackText: '',
  };
}
