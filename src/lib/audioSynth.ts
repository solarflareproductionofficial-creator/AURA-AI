import { MusicTrack } from '../types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let activeTimeouts: NodeJS.Timeout[] = [];
let isPlayingTrack = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getAudioAnalyser(): AnalyserNode | null {
  getAudioContext();
  return analyser;
}

export function playNote(freq: number, duration: number = 0.5, type: OscillatorType = 'sine', volume: number = 0.25): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  // Smooth ADSR envelope
  const now = ctx.currentTime;
  noteGain.gain.setValueAtTime(0, now);
  noteGain.gain.linearRampToValueAtTime(volume, now + 0.04);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(noteGain);
  noteGain.connect(masterGain!);

  osc.start(now);
  osc.stop(now + duration + 0.05);
}

export function playChord(frequencies: number[], duration: number = 2.0, preset: string = 'warm_pad'): void {
  const ctx = getAudioContext();
  const chordGain = ctx.createGain();
  const now = ctx.currentTime;

  chordGain.gain.setValueAtTime(0, now);
  chordGain.gain.linearRampToValueAtTime(0.2 / Math.sqrt(frequencies.length), now + 0.15);
  chordGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  chordGain.connect(masterGain!);

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = preset === 'synthwave' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // slight detune for lush thickness
    const detuneCents = (Math.random() - 0.5) * 8;
    osc.detune.setValueAtTime(detuneCents, now);

    osc.connect(chordGain);
    osc.start(now);
    osc.stop(now + duration);
  });
}

export function playDrum(type: 'kick' | 'snare' | 'hihat'): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  if (type === 'kick') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.35);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'snare') {
    // Noise buffer
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain!);
    noise.start(now);
  } else {
    // Hi-hat (short high metallic noise)
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain!);
    noise.start(now);
  }
}

export function stopCurrentPlayback(): void {
  activeTimeouts.forEach((t) => clearTimeout(t));
  activeTimeouts = [];
  isPlayingTrack = false;
}

export function playFullMusicTrack(
  track: MusicTrack,
  onProgress?: (progressPercent: number) => void,
  onEnd?: () => void
): () => void {
  stopCurrentPlayback();
  isPlayingTrack = true;

  const secondsPerBeat = 60 / (track.bpm || 85);
  const totalDuration = 16 * secondsPerBeat; // 4 bars loop
  const startTime = Date.now();

  const progressInterval = setInterval(() => {
    if (!isPlayingTrack) {
      clearInterval(progressInterval);
      return;
    }
    const elapsed = (Date.now() - startTime) / 1000;
    const percent = Math.min(100, Math.round((elapsed / totalDuration) * 100));
    if (onProgress) onProgress(percent);
    if (elapsed >= totalDuration) {
      clearInterval(progressInterval);
      isPlayingTrack = false;
      if (onEnd) onEnd();
    }
  }, 100);

  // Schedule chords
  let chordTimeOffset = 0;
  (track.chords || []).forEach((chord) => {
    const t = setTimeout(() => {
      if (!isPlayingTrack) return;
      playChord(chord.notes, (chord.duration || 2) * secondsPerBeat * 1.5, track.synthPreset);
    }, chordTimeOffset * 1000);
    activeTimeouts.push(t);
    chordTimeOffset += (chord.duration || 2) * secondsPerBeat;
  });

  // Schedule lead melody
  (track.leadMelody || []).forEach((item) => {
    const t = setTimeout(() => {
      if (!isPlayingTrack) return;
      playNote(item.frequency, (item.duration || 0.5) * secondsPerBeat, 'triangle', 0.28);
    }, item.time * secondsPerBeat * 1000);
    activeTimeouts.push(t);
  });

  // Schedule rhythm drums
  if (track.drumPattern) {
    (track.drumPattern.kickTimes || []).forEach((kt) => {
      const t = setTimeout(() => {
        if (!isPlayingTrack) return;
        playDrum('kick');
      }, kt * secondsPerBeat * 1000);
      activeTimeouts.push(t);
    });
    (track.drumPattern.snareTimes || []).forEach((st) => {
      const t = setTimeout(() => {
        if (!isPlayingTrack) return;
        playDrum('snare');
      }, st * secondsPerBeat * 1000);
      activeTimeouts.push(t);
    });
    (track.drumPattern.hihatTimes || []).forEach((ht) => {
      const t = setTimeout(() => {
        if (!isPlayingTrack) return;
        playDrum('hihat');
      }, ht * secondsPerBeat * 1000);
      activeTimeouts.push(t);
    });
  }

  return () => {
    clearInterval(progressInterval);
    stopCurrentPlayback();
  };
}
