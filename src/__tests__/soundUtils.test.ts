import { soundManager, playSoundEffect } from '@/utils/soundUtils';

// Mock fetch to return a mock audio buffer
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock Web Audio API
const mockAudioContext = {
  decodeAudioData: jest.fn().mockResolvedValue({}),
  createBufferSource: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn() },
  }),
};

// Mock window.AudioContext
Object.defineProperty(window, 'AudioContext', {
  value: jest.fn().mockImplementation(() => mockAudioContext),
  writable: true,
});

describe('soundUtils', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
    
    // Mock fetch to return a mock response by default
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
    } as any);
    
    // Reset soundManager state
    soundManager.setEnabled(true);
  });

  describe('soundManager', () => {
    it('should be enabled by default', () => {
      expect(soundManager.isEnabled()).toBe(true);
    });

    it('should allow setting enabled state', () => {
      soundManager.setEnabled(false);
      expect(soundManager.isEnabled()).toBe(false);
      
      soundManager.setEnabled(true);
      expect(soundManager.isEnabled()).toBe(true);
    });

    it('should not play sound when disabled', async () => {
      soundManager.setEnabled(false);
      
      // Should not throw and should return void
      const result = await soundManager.playSound('cardFlip');
      expect(result).toBeUndefined();
    });

    it('should initialize sounds without errors', async () => {
      await expect(soundManager.initializeSounds()).resolves.not.toThrow();
    });

    it('should handle sound initialization errors gracefully', async () => {
      // Mock fetch to fail
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      // Should not throw even if initialization fails
      await expect(soundManager.initializeSounds()).resolves.not.toThrow();
    });
  });

  describe('playSoundEffect', () => {
    it('should have all required sound effects', () => {
      expect(playSoundEffect.cardFlip).toBeDefined();
      expect(playSoundEffect.cardMove).toBeDefined();
      expect(playSoundEffect.cardDrop).toBeDefined();
      expect(playSoundEffect.stockFlip).toBeDefined();
      expect(playSoundEffect.shuffle).toBeDefined();
      expect(playSoundEffect.win).toBeDefined();
      expect(playSoundEffect.error).toBeDefined();
    });

    it('should call soundManager.playSound with correct parameters', async () => {
      const playSoundSpy = jest.spyOn(soundManager, 'playSoundIfEnabled').mockResolvedValue();
      
      await playSoundEffect.cardFlip();
      expect(playSoundSpy).toHaveBeenCalledWith('cardFlip');
      
      await playSoundEffect.shuffle();
      expect(playSoundSpy).toHaveBeenCalledWith('shuffle');
      
      await playSoundEffect.win();
      expect(playSoundSpy).toHaveBeenCalledWith('win');
      
      playSoundSpy.mockRestore();
    });
  });
});