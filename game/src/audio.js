// Twin Tales — Spot the Difference: the sound effects.
// One job: every sound the game makes, synthesized with WebAudio at run time —
// no audio files, no network. A sound is a short envelope over an oscillator.

export class SoundFX {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  /** Create the audio context on the first user gesture; browsers block it before. */
  ensure() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') void this.context.resume();
  }

  tone(frequency, seconds, type, volume, when = 0) {
    if (this.muted || !this.context) return;
    const start = this.context.currentTime + when;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.05);
  }

  /** A bright two-note chime for a difference found. */
  found() {
    this.tone(880, 0.16, 'sine', 0.25);
    this.tone(1318, 0.28, 'sine', 0.22, 0.09);
  }

  /** A low buzz for a wrong click. */
  wrong() {
    this.tone(160, 0.22, 'square', 0.12);
    this.tone(110, 0.3, 'square', 0.1, 0.05);
  }

  /** A soft blip when a hint is spent. */
  hint() {
    this.tone(660, 0.12, 'triangle', 0.18);
    this.tone(990, 0.18, 'triangle', 0.15, 0.08);
  }

  /** A rising arpeggio for a finished level. */
  win() {
    [523, 659, 784, 1047].forEach((note, i) => this.tone(note, 0.32, 'triangle', 0.2, i * 0.11));
  }

  /** A short tick when the timer drops under ten seconds. */
  tick() {
    this.tone(1200, 0.06, 'square', 0.08);
  }
}
