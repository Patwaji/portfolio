/**
 * Fully synthesized audio — no assets. A low binaural-ish drone with slowly
 * breathing filtered noise for the ambience, plus tiny sine pings for UI.
 */
export class MindAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = false;

  get isEnabled() {
    return this.enabled;
  }

  toggle(): boolean {
    if (this.enabled) {
      this.enabled = false;
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      }
    } else {
      this.enabled = true;
      this.ensureContext();
      if (this.master && this.ctx) {
        this.ctx.resume();
        this.master.gain.setTargetAtTime(0.8, this.ctx.currentTime, 0.8);
      }
    }
    return this.enabled;
  }

  private ensureContext() {
    if (this.ctx) return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    // --- drone: two barely-detuned oscillators an octave apart
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.05;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 240;
    droneGain.connect(lowpass).connect(this.master);

    for (const [freq, detune] of [
      [55, 0],
      [55, 4],
      [110, -3],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      osc.connect(droneGain);
      osc.start();
    }

    // --- air: looped noise through a slowly sweeping bandpass
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 520;
    bandpass.Q.value = 1.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.012;
    noise.connect(bandpass).connect(noiseGain).connect(this.master);
    noise.start();

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 280;
    lfo.connect(lfoGain).connect(bandpass.frequency);
    lfo.start();
  }

  /** Short soft ping — node hovers, UI ticks. */
  ping(freq = 720, vol = 0.08) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.82, t + 0.28);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  /** Deeper thump for the destabilize toy. */
  thump() {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.5);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.9);
  }
}

export const mindAudio = new MindAudio();
