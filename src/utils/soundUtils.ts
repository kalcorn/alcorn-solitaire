/**
 * Sound utilities for game audio feedback
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Initialize AudioContext only on user interaction to avoid Chrome warnings
    // Skip during SSR
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  private initializeAudioContext() {
    try {
      if (typeof window !== 'undefined') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private async resumeAudioContext() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Generate a simple tone using Web Audio API
   */
  private generateTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
      }
      
      // Apply fade out to prevent clicks
      const fadeOut = Math.max(0, 1 - (t / duration) * 2);
      channelData[i] = sample * 0.1 * fadeOut; // Keep volume low
    }

    return buffer;
  }

  /**
   * Initialize sound effects
   */
  public initializeSounds() {
    if (!this.audioContext) return;

    // Generate different tones for different actions
    const cardFlip = this.generateTone(800, 0.1, 'sine');
    const cardMove = this.generateTone(600, 0.08, 'triangle');
    const cardDrop = this.generateTone(400, 0.12, 'sine');
    const stockFlip = this.generateTone(500, 0.15, 'square');
    const winSound = this.generateTone(1000, 0.3, 'sine');
    const errorSound = this.generateTone(200, 0.2, 'square');

    if (cardFlip) this.sounds.set('cardFlip', cardFlip);
    if (cardMove) this.sounds.set('cardMove', cardMove);
    if (cardDrop) this.sounds.set('cardDrop', cardDrop);
    if (stockFlip) this.sounds.set('stockFlip', stockFlip);
    if (winSound) this.sounds.set('win', winSound);
    if (errorSound) this.sounds.set('error', errorSound);
  }

  /**
   * Play a sound effect
   */
  public async playSound(soundName: string): Promise<void> {
    if (!this.enabled || !this.audioContext || !this.sounds.has(soundName)) {
      return;
    }

    try {
      await this.resumeAudioContext();
      
      const buffer = this.sounds.get(soundName);
      if (!buffer) return;

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set volume based on sound type
      const volume = soundName === 'win' ? 0.3 : 0.15;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  /**
   * Enable or disable sound effects
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Create singleton instance
export const soundManager = new SoundManager();

// Initialize sounds on first user interaction (client-side only)
let soundsInitialized = false;
const initializeSoundsOnInteraction = () => {
  if (!soundsInitialized) {
    soundManager.initializeSounds();
    soundsInitialized = true;
    // Remove listeners after first initialization
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', initializeSoundsOnInteraction);
      document.removeEventListener('touchstart', initializeSoundsOnInteraction);
    }
  }
};

// Wait for user interaction to initialize sounds (client-side only)
if (typeof document !== 'undefined') {
  document.addEventListener('click', initializeSoundsOnInteraction);
  document.addEventListener('touchstart', initializeSoundsOnInteraction);
}

/**
 * Utility functions for playing specific game sounds
 */
export const playSoundEffect = {
  cardFlip: () => soundManager.playSound('cardFlip'),
  cardMove: () => soundManager.playSound('cardMove'),
  cardDrop: () => soundManager.playSound('cardDrop'),
  stockFlip: () => soundManager.playSound('stockFlip'),
  win: () => soundManager.playSound('win'),
  error: () => soundManager.playSound('error')
};

export default soundManager;