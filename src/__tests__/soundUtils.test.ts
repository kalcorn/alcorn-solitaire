import { soundManager, playSoundEffect } from '@/utils/soundUtils';

// Mock AudioContext since it's already mocked in jest.setup.js
describe('soundUtils', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
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

    it('should initialize sounds without errors', () => {
      expect(() => soundManager.initializeSounds()).not.toThrow();
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
      const playSoundSpy = jest.spyOn(soundManager, 'playSound');
      
      await playSoundEffect.cardFlip();
      expect(playSoundSpy).toHaveBeenCalledWith('cardFlip');
      
      await playSoundEffect.shuffle();
      expect(playSoundSpy).toHaveBeenCalledWith('shuffle');
      
      await playSoundEffect.win();
      expect(playSoundSpy).toHaveBeenCalledWith('win');
    });
  });
});