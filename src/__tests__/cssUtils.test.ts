import { cn, composeClasses, conditionalClasses } from '../utils/cssUtils';

describe('CSS Utils', () => {
  describe('cn', () => {
    it('should combine class names', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden');
      expect(result).toBe('base conditional');
    });

    it('should handle arrays and objects', () => {
      const result = cn('base', ['array1', 'array2'], { object1: true, object2: false });
      expect(result).toBe('base array1 array2 object1');
    });

    it('should handle empty inputs', () => {
      const result = cn('', null, undefined, false);
      expect(result).toBe('');
    });
  });

  describe('composeClasses', () => {
    const moduleClasses = {
      container: 'module-container',
      button: 'module-button',
      active: 'module-active'
    };

    it('should compose module classes with tailwind', () => {
      const result = composeClasses(moduleClasses, ['container', 'button'], 'tw-class1 tw-class2');
      expect(result).toBe('module-container module-button tw-class1 tw-class2');
    });

    it('should handle only module classes', () => {
      const result = composeClasses(moduleClasses, ['container', 'active']);
      expect(result).toBe('module-container module-active');
    });

    it('should handle only tailwind classes', () => {
      const result = composeClasses(moduleClasses, [], 'tw-class1 tw-class2');
      expect(result).toBe('tw-class1 tw-class2');
    });

    it('should filter out non-existent module keys', () => {
      const result = composeClasses(moduleClasses, ['container', 'nonexistent', 'button']);
      expect(result).toBe('module-container module-button');
    });
  });

  describe('conditionalClasses', () => {
    const moduleClasses = {
      container: 'module-container',
      button: 'module-button',
      active: 'module-active',
      disabled: 'module-disabled'
    };

    it('should return classes for true conditions', () => {
      const conditions = {
        container: true,
        button: false,
        active: true,
        disabled: false
      };
      
      const result = conditionalClasses(moduleClasses, conditions);
      expect(result).toEqual(['module-container', 'module-active']);
    });

    it('should handle all false conditions', () => {
      const conditions = {
        container: false,
        button: false,
        active: false
      };
      
      const result = conditionalClasses(moduleClasses, conditions);
      expect(result).toEqual([]);
    });

    it('should handle all true conditions', () => {
      const conditions = {
        container: true,
        button: true,
        active: true
      };
      
      const result = conditionalClasses(moduleClasses, conditions);
      expect(result).toEqual(['module-container', 'module-button', 'module-active']);
    });

    it('should filter out non-existent module keys', () => {
      const conditions = {
        container: true,
        nonexistent: true,
        button: false
      };
      
      const result = conditionalClasses(moduleClasses, conditions);
      expect(result).toEqual(['module-container']);
    });
  });
}); 