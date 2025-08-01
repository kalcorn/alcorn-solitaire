/**
 * Sound utilities for game audio feedback
 */

interface GameSettings {
  soundEnabled: boolean;
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private gameSettings: GameSettings | null = null;
  private preloadPromise: Promise<void> | null = null;

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
      console.error('Failed to initialize audio context:', error);
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
   * Generate a realistic card flip sound with multiple frequency components
   */
  private generateCardFlipSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.08; // Very short for sharp flip sound
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Multiple frequency components for realistic card sound
      const highFreq = Math.sin(2 * Math.PI * 1200 * t) * 0.3; // Sharp high component
      const midFreq = Math.sin(2 * Math.PI * 600 * t) * 0.4;   // Mid frequency
      const lowFreq = Math.sin(2 * Math.PI * 300 * t) * 0.2;   // Low thump
      
      // Add some noise for texture
      const noise = (Math.random() - 0.5) * 0.05;
      
      let sample = highFreq + midFreq + lowFreq + noise;
      
      // Sharp attack and quick decay envelope
      const attackTime = 0.005;
      const envelope = t < attackTime 
        ? t / attackTime 
        : Math.exp(-10 * (t - attackTime));
      
      channelData[i] = sample * 0.08 * envelope; // Keep volume low
    }

    return buffer;
  }

  /**
   * Generate a realistic deck shuffle sound - crisp and lengthy
   */
  private generateShuffleSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.2; // Longer duration for more realistic shuffle
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Phase 1: Initial card separation (0-0.3s)
      if (t < 0.3) {
        const phase1Progress = t / 0.3;
        // Sharp initial swoosh
        const swooshFreq = 300 + phase1Progress * 200;
        const swooshEnv = Math.exp(-phase1Progress * 8) * (1 - phase1Progress);
        sample += Math.sin(2 * Math.PI * swooshFreq * t) * swooshEnv * 0.3;
        
        // Crisp paper rustling
        const rustleNoise = (Math.random() - 0.5) * 0.4;
        const rustleEnv = Math.sin(Math.PI * phase1Progress) * 0.2;
        sample += rustleNoise * rustleEnv;
      }
      
      // Phase 2: Active shuffling (0.3-0.9s)
      else if (t < 0.9) {
        const phase2Progress = (t - 0.3) / 0.6;
        
        // Multiple card flip sounds
        for (let f = 0; f < 12; f++) {
          const flipTime = 0.3 + (f * 0.05) + (Math.random() * 0.02);
          const flipDuration = 0.08;
          
          if (t >= flipTime && t < flipTime + flipDuration) {
            const localT = (t - flipTime) / flipDuration;
            // Sharp attack, quick decay like individual card flips
            const flipEnv = Math.exp(-localT * 15) * (localT < 0.3 ? localT / 0.3 : 1);
            const flipFreq = 800 + (f * 100) + (Math.random() * 200);
            sample += Math.sin(2 * Math.PI * flipFreq * t) * flipEnv * 0.15;
            
            // Add harmonic for crispness
            sample += Math.sin(2 * Math.PI * flipFreq * 2 * t) * flipEnv * 0.08;
          }
        }
        
        // Continuous rustling during shuffling
        const rustleNoise = (Math.random() - 0.5) * 0.5;
        const rustleEnv = 0.3 * (1 - Math.abs(phase2Progress - 0.5) * 2);
        sample += rustleNoise * rustleEnv;
        
        // Periodic swooshes for riffle shuffle effect
        const riffleFreq = 2; // 2 Hz riffle rate
        const rifflePhase = Math.sin(2 * Math.PI * riffleFreq * t);
        if (rifflePhase > 0.7) {
          const riffleEnv = (rifflePhase - 0.7) / 0.3;
          sample += Math.sin(2 * Math.PI * 400 * t) * riffleEnv * 0.2;
        }
      }
      
      // Phase 3: Final settling (0.9-1.2s)
      else {
        const phase3Progress = (t - 0.9) / 0.3;
        // Gentle settling sounds
        const settleNoise = (Math.random() - 0.5) * 0.2;
        const settleEnv = (1 - phase3Progress) * 0.15;
        sample += settleNoise * settleEnv;
        
        // Final tap sound
        if (t > 1.1 && t < 1.15) {
          const tapT = (t - 1.1) / 0.05;
          const tapEnv = Math.exp(-tapT * 20);
          sample += Math.sin(2 * Math.PI * 200 * t) * tapEnv * 0.2;
        }
      }
      
      // High-frequency crispness throughout
      const crispNoise = (Math.random() - 0.5) * 0.1;
      const crispFilter = Math.sin(2 * Math.PI * 3000 * t) * 0.03;
      sample += (crispNoise + crispFilter) * Math.sin(Math.PI * t / duration);
      
      // Overall envelope with smooth attack and decay
      let mainEnvelope;
      if (t < 0.05) {
        mainEnvelope = t / 0.05; // Quick attack
      } else if (t > duration - 0.1) {
        mainEnvelope = (duration - t) / 0.1; // Smooth decay
      } else {
        mainEnvelope = 1;
      }
      
      channelData[i] = sample * mainEnvelope * 0.15; // Slightly louder for impact
    }

    return buffer;
  }

  /**
   * Load an MP3 file and decode it to an AudioBuffer
   */
  private async loadMP3Sound(url: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound: ${url}`, error);
      return null;
    }
  }

  /**
   * Preload sound files asynchronously in the background
   */
  public async preloadSounds(soundFiles: string[] = ['/sounds/card_flip.mp3', '/sounds/card_shuffle.mp3']): Promise<void> {
    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    this.preloadPromise = this.initializeSounds(soundFiles);
    return this.preloadPromise;
  }

  /**
   * Initialize sound effects with optional preloading
   */
  private async initializeSounds(soundFiles?: string[]) {
    if (!this.audioContext) {
      return;
    }

    const filesToLoad = soundFiles || ['/sounds/card_flip.mp3', '/sounds/card_shuffle.mp3'];
    
    // Load MP3 files for card movements and shuffling
    const loadPromises = filesToLoad.map(async (file) => {
      try {
        return await this.loadMP3Sound(file);
      } catch (error) {
        console.warn(`Failed to preload sound: ${file}`, error);
        return null;
      }
    });

    const [cardFlipBuffer, shuffleBuffer] = await Promise.all(loadPromises);
    
    // Generate remaining sounds using Web Audio API
    const winSound = this.generateTone(1000, 0.3, 'sine');
    const errorSound = this.generateTone(200, 0.2, 'square');

    if (cardFlipBuffer) {
      this.sounds.set('cardFlip', cardFlipBuffer);
      this.sounds.set('cardMove', cardFlipBuffer); // Use same sound for card movements
      this.sounds.set('cardDrop', cardFlipBuffer); // Use same sound for card drops
    } else {
      // Fallback to generated sounds if MP3 loading fails
      const cardFlip = this.generateCardFlipSound();
      const cardMove = this.generateTone(600, 0.08, 'triangle');
      const cardDrop = this.generateTone(400, 0.12, 'sine');
      if (cardFlip) this.sounds.set('cardFlip', cardFlip);
      if (cardMove) this.sounds.set('cardMove', cardMove);
      if (cardDrop) this.sounds.set('cardDrop', cardDrop);
    }

    if (shuffleBuffer) {
      this.sounds.set('shuffle', shuffleBuffer);
    } else {
      // Fallback to generated shuffle sound
      const shuffleSound = this.generateShuffleSound();
      if (shuffleSound) this.sounds.set('shuffle', shuffleSound);
    }

    if (winSound) this.sounds.set('win', winSound);
    if (errorSound) this.sounds.set('error', errorSound);
  }

  /**
   * Set game settings for centralized sound control
   */
  public setGameSettings(settings: GameSettings): void {
    this.gameSettings = settings;
  }

  /**
   * Centralized function to play sounds with automatic settings check
   */
  public async playSoundIfEnabled(soundName: string): Promise<void> {
    // Check game settings first, then fallback to internal enabled state
    const shouldPlay = this.gameSettings ? this.gameSettings.soundEnabled : this.enabled;
    
    if (!shouldPlay || !this.audioContext || !this.sounds.has(soundName)) {
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
      // Silent error handling in production
    }
  }

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use playSoundIfEnabled instead
   */
  public async playSound(soundName: string): Promise<void> {
    return this.playSoundIfEnabled(soundName);
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
const initializeSoundsOnInteraction = async () => {
  if (!soundsInitialized) {
    await soundManager.preloadSounds();
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

// Also preload sounds immediately in the background (non-blocking)
if (typeof window !== 'undefined') {
  // Start preloading sounds as soon as the module loads
  soundManager.preloadSounds().catch(() => {
    // Silent failure - sounds will initialize on first interaction
  });
}

/**
 * Utility functions for playing specific game sounds with automatic settings check
 */
export const playSoundEffect = {
  cardFlip: () => soundManager.playSoundIfEnabled('cardFlip'),
  cardMove: () => soundManager.playSoundIfEnabled('cardMove'),
  cardDrop: () => soundManager.playSoundIfEnabled('cardDrop'),
  stockFlip: () => soundManager.playSoundIfEnabled('cardFlip'), // Use cardFlip sound for stock flips
  shuffle: () => soundManager.playSoundIfEnabled('shuffle'),
  win: () => soundManager.playSoundIfEnabled('win'),
  error: () => soundManager.playSoundIfEnabled('error')
};

/**
 * Initialize sound system with game settings
 */
export const initializeSoundSystem = (gameSettings: GameSettings) => {
  soundManager.setGameSettings(gameSettings);
};

export default soundManager;