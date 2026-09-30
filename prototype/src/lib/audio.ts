// Alarm sound for the prototype, generated with Web Audio so no sound files are needed.
// Browsers only allow audio after the viewer has interacted with the page.

type Kind = 'own' | 'friend';

let ctx: AudioContext | null = null;
let timer: number | null = null;
let current: Kind | null = null;

export function unlockAudio(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

function burst(kind: Kind): void {
  if (!ctx) return;
  const notes = kind === 'own' ? [988, 1319, 988, 1319] : [659, 784, 659, 784];
  const t0 = ctx.currentTime + 0.02;
  notes.forEach((frequency, i) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = 'triangle';
    osc.frequency.value = frequency;
    const start = t0 + i * 0.16;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
    osc.connect(gain).connect(ctx!.destination);
    osc.start(start);
    osc.stop(start + 0.16);
  });
  try {
    navigator.vibrate?.([350, 150, 350]);
  } catch {
    // Vibration isn't available everywhere.
  }
}

export function startRinging(kind: Kind): void {
  if (current === kind && timer !== null) return;
  stopRinging();
  current = kind;
  unlockAudio();
  burst(kind);
  timer = window.setInterval(() => burst(kind), 1100);
}

export function stopRinging(): void {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
  current = null;
  try {
    navigator.vibrate?.(0);
  } catch {
    // Ignore.
  }
}
