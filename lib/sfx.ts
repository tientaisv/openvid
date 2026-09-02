// High-fidelity synthesized UI Sound Effects (WAV Data URIs)

function createWavDataUri(sampleRate: number, samples: Float32Array): string {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + samples.length * 2, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw PCM)
    view.setUint16(20, 1, true);
    // channel count (1 = mono)
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sampleRate * 2)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, samples.length * 2, true);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// 1. Crisp Apple-style Mouse Click (Pop)
export function generateCrispClickSound(): string {
    const sampleRate = 44100;
    const duration = 0.09; // 90ms
    const numSamples = Math.floor(sampleRate * duration);
    const samples = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        // High transient click pop
        const freq1 = 2800 * Math.exp(-t * 120);
        const freq2 = 900 * Math.exp(-t * 60);
        const envelope = Math.exp(-t * 70);
        const pop = Math.sin(2 * Math.PI * freq1 * t) * 0.7 + Math.sin(2 * Math.PI * freq2 * t) * 0.3;
        samples[i] = pop * envelope * 0.95;
    }

    return createWavDataUri(sampleRate, samples);
}

// 2. Mechanical Switch Click
export function generateMechanicalClickSound(): string {
    const sampleRate = 44100;
    const duration = 0.12; // 120ms
    const numSamples = Math.floor(sampleRate * duration);
    const samples = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const click = (Math.random() * 2 - 1) * Math.exp(-t * 200) * 0.5;
        const tone = Math.sin(2 * Math.PI * 1600 * Math.exp(-t * 80) * t) * Math.exp(-t * 50) * 0.5;
        samples[i] = (click + tone) * 0.9;
    }

    return createWavDataUri(sampleRate, samples);
}

// Pre-generated static URIs
export const CLICK_SOUND_DATA_URI = generateCrispClickSound();
export const CLICK_SOUND_ID = "builtin_sfx_click_01";
export const CLICK_SOUND_NAME = "Mouse Click (Crisp Pop)";
