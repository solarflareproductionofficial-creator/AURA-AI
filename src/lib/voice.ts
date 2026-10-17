/**
 * Speech Recognition and Speech Synthesis helper
 */

// Voice Recognition
export class VoiceAssistant {
  private recognition: any = null;
  public isSupported: boolean = false;
  private onResultCallback?: (text: string) => void;
  private onErrorCallback?: (err: any) => void;
  private onEndCallback?: () => void;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'tr-TR'; // Default to Turkish, adapts automatically

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (this.onResultCallback) {
          this.onResultCallback(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (this.onErrorCallback) this.onErrorCallback(event.error);
      };

      this.recognition.onend = () => {
        if (this.onEndCallback) this.onEndCallback();
      };
    }
  }

  public setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public startListening(
    onResult: (text: string) => void,
    onEnd: () => void,
    onError?: (err: any) => void
  ): boolean {
    if (!this.recognition) return false;
    this.onResultCallback = onResult;
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;
    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Speech recognition already active', e);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }
}

// Text to Speech
export async function speakText(text: string, lang: string = 'tr-TR'): Promise<void> {
  // First attempt server Gemini TTS
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 300), voice: 'Kore' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.audioDataUrl) {
        const audio = new Audio(data.audioDataUrl);
        await audio.play();
        return;
      }
    }
  } catch (err) {
    // fallback to window.speechSynthesis
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
