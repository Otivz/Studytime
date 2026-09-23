// Web Audio API sound synthesis - fully offline and self-contained

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Celebratory clapping & applause for study completion
export function playStudyCompleteSound(volume = 70): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime((volume / 100) * 0.55, now);
    masterGain.connect(ctx.destination);

    // 1. Uplifting background chord (C5, G5, C6) with soft attack
    const chordNotes = [523.25, 783.99, 1046.50];
    chordNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      oscGain.gain.setValueAtTime(0, now + idx * 0.08);
      oscGain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.04);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.6);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.7);
    });

    // 2. Realistic enthusiastic hand claps (staggered applause bursts)
    const clapTimings = [
      0.15, 0.28, 0.42, 0.54, 0.65, 0.77, 0.88, 1.00, 1.12, 1.25, 1.38, 1.52, 1.68
    ];

    clapTimings.forEach((startTime, idx) => {
      // Create noise buffer for clap snap & hollow palm resonance
      const clapDuration = 0.075;
      const bufferSize = Math.floor(ctx.sampleRate * clapDuration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        // Fast decaying noise burst simulating acoustic hand clap
        const decay = Math.exp(-i / (bufferSize * 0.18));
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter centered at typical clap frequencies (1000Hz - 1500Hz)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1150 + ((idx % 3) * 120), now + startTime);
      bandpass.Q.setValueAtTime(1.6, now + startTime);

      const clapGain = ctx.createGain();
      // Slight variation in volume for natural crowd/individual feel
      const clapVol = 0.24 + (Math.random() * 0.1);
      clapGain.gain.setValueAtTime(clapVol, now + startTime);
      clapGain.gain.exponentialRampToValueAtTime(0.001, now + startTime + clapDuration);

      noise.connect(bandpass);
      bandpass.connect(clapGain);
      clapGain.connect(masterGain);

      noise.start(now + startTime);
      noise.stop(now + startTime + clapDuration + 0.01);
    });
  } catch (e) {
    console.warn('Study completion clapping audio failed', e);
  }
}

// Repeating Break Alarm - keeps repeating until dismissed
let breakAlarmInterval: number | null = null;

function playSingleAlarmPulse(volume = 70): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime((volume / 100) * 0.45, now);
    masterGain.connect(ctx.destination);

    // Distinct triple-pulse alarm pattern: "beep... beep... beep..."
    const beeps = [0, 0.22, 0.44];
    beeps.forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Crisp clear alarm tone (880Hz / A5)
      osc.frequency.setValueAtTime(880, now + offset);

      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.35, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + offset);
      osc.stop(now + offset + 0.18);
    });
  } catch (e) {
    console.warn('Alarm pulse failed', e);
  }
}

export function startBreakAlarmLoop(volume = 70): void {
  stopBreakAlarmLoop(); // Ensure no duplicate intervals
  playSingleAlarmPulse(volume);
  // Repeat alarm pattern every 1.5 seconds until dismissed
  breakAlarmInterval = window.setInterval(() => {
    playSingleAlarmPulse(volume);
  }, 1500);
}

export function stopBreakAlarmLoop(): void {
  if (breakAlarmInterval !== null) {
    clearInterval(breakAlarmInterval);
    breakAlarmInterval = null;
  }
}

// Gentle pleasant chime for break finish (starts repeating alarm loop)
export function playBreakCompleteSound(volume = 70): void {
  startBreakAlarmLoop(volume);
}

// Celebratory fanfare chime + short clap sound for reaching 100% goal
export function playGoalCelebrationSound(volume = 70): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime((volume / 100) * 0.5, now);
    masterGain.connect(ctx.destination);

    // 1. Triumphant fanfare arpeggio: C5, E5, G5, B5, C6, E6
    const fanfareNotes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
    fanfareNotes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = index === fanfareNotes.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.1);

      noteGain.gain.setValueAtTime(0, now + index * 0.1);
      noteGain.gain.linearRampToValueAtTime(0.35, now + index * 0.1 + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 1.6);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 1.8);
    });

    // 2. Short pleasant applause / rhythmic claps (synthesized noise bursts)
    const clapTimes = [0.65, 0.85, 1.05, 1.25, 1.45];
    clapTimes.forEach((clapTime) => {
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1100 + Math.random() * 200, now + clapTime);
      bandpass.Q.setValueAtTime(1.5, now + clapTime);

      const clapGain = ctx.createGain();
      clapGain.gain.setValueAtTime(0.18, now + clapTime);
      clapGain.gain.exponentialRampToValueAtTime(0.001, now + clapTime + 0.08);

      noise.connect(bandpass);
      bandpass.connect(clapGain);
      clapGain.connect(masterGain);

      noise.start(now + clapTime);
      noise.stop(now + clapTime + 0.09);
    });
  } catch (e) {
    console.warn('Goal celebration audio playback failed', e);
  }
}

// Backward-compatibility alias
export const playChimeSound = playStudyCompleteSound;

// Subtle click/tap feedback
export function playTickSound(volume = 0.2): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime((volume / 100) * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Ignore audio context initialization failures
  }
}

// Ambient Sound Synthesizer (White noise / Rain / Stream)
let ambientSource: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function stopAmbientSound(): void {
  if (ambientGain && audioCtx) {
    ambientGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      if (ambientSource) {
        try {
          ambientSource.disconnect();
        } catch {
          // ignore
        }
        ambientSource = null;
      }
      ambientGain = null;
    }, 500);
  }
}

export function startAmbientSound(type: 'rain' | 'whitenoise' | 'stream', volume = 40): void {
  stopAmbientSound();
  try {
    const ctx = getAudioContext();
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'rain' || type === 'stream') {
        // Pink / Brownian noise filter for relaxing water / rain
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      } else {
        // Pure soft white noise
        output[i] = white * 0.2;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to make sound soft & soothing
    const filter = ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, ctx.currentTime);
    } else if (type === 'stream') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.Q.setValueAtTime(0.6, ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
    }

    ambientGain = ctx.createGain();
    const targetGain = ((volume / 100) * 0.15);
    ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 1.0);

    whiteNoise.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    whiteNoise.start();
    ambientSource = whiteNoise;
  } catch (err) {
    console.warn('Could not start ambient sound', err);
  }
}
