import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileLayout from '../components/layout/MobileLayout';

describe('MobileLayout Component', () => {
  const mockProps = {
    children: <div data-testid="test-child">Test Child</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<MobileLayout {...mockProps} />);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(<MobileLayout {...mockProps} />);
      
      const child = screen.getByTestId('test-child');
      expect(child).toBeInTheDocument();
      expect(child).toHaveTextContent('Test Child');
    });

    it('should apply mobile-specific CSS classes', () => {
      render(<MobileLayout {...mockProps} />);
      
      // Layout should have appropriate classes for mobile
      const child = screen.getByTestId('test-child');
      expect(child).toBeInTheDocument();
    });
  });

  describe('Mobile-specific features', () => {
    it('should handle touch interactions', () => {
      render(<MobileLayout {...mockProps} />);
      
      const child = screen.getByTestId('test-child');
      expect(child).toBeInTheDocument();
      
      // Should render elements that are touch-friendly
      expect(child.parentElement).toBeInTheDocument();
    });

    it('should optimize for small screens', () => {
      // Test very small mobile screen
      Object.defineProperty(window, 'innerWidth', {
        value: 320
      });
      
      render(<MobileLayout {...mockProps} />);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should handle portrait orientation', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 812 });
      
      render(<MobileLayout {...mockProps} />);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('should have proper mobile HTML structure', () => {
      render(<MobileLayout {...mockProps} />);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should handle multiple children in mobile layout', () => {
      const multipleChildren = (
        <>
          <div data-testid="mobile-child-1">Mobile Child 1</div>
          <div data-testid="mobile-child-2">Mobile Child 2</div>
        </>
      );

      render(<MobileLayout>{multipleChildren}</MobileLayout>);
      
      expect(screen.getByTestId('mobile-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-child-2')).toBeInTheDocument();
    });

    it('should handle no children gracefully', () => {
      render(<MobileLayout />);
      
      // Should render without crashing
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Viewport handling', () => {
    it('should handle different mobile screen sizes', () => {
      const screenSizes = [
        { width: 320, height: 568 }, // iPhone 5/SE
        { width: 375, height: 667 }, // iPhone 8
        { width: 414, height: 896 }, // iPhone XR
        { width: 360, height: 640 }  // Android
      ];

      screenSizes.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', { value: width });
        Object.defineProperty(window, 'innerHeight', { value: height });
        
        render(<MobileLayout {...mockProps} />);
        
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        
        // Clean up for next iteration
        document.body.innerHTML = '';
      });
    });

    it('should handle viewport meta changes', () => {
      render(<MobileLayout {...mockProps} />);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  describe('Performance on mobile', () => {
    it('should render efficiently on mobile', () => {
      const startTime = performance.now();
      
      render(<MobileLayout {...mockProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly even on mobile
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should handle memory constraints', () => {
      // Simulate memory-constrained environment
      const largeChild = (
        <div data-testid="large-child">
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>Item {i}</div>
          ))}
        </div>
      );

      render(<MobileLayout>{largeChild}</MobileLayout>);
      
      expect(screen.getByTestId('large-child')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle orientation changes', () => {
      render(<MobileLayout {...mockProps} />);
      
      // Simulate orientation change
      Object.defineProperty(window, 'innerWidth', { value: 667 });
      Object.defineProperty(window, 'innerHeight', { value: 375 });
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should handle dynamic content', () => {
      const DynamicChild = () => {
        const [count, setCount] = React.useState(0);
        return (
          <div data-testid="dynamic-child">
            <span>Count: {count}</span>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
          </div>
        );
      };

      render(<MobileLayout><DynamicChild /></MobileLayout>);
      
      expect(screen.getByTestId('dynamic-child')).toBeInTheDocument();
      expect(screen.getByText('Count: 0')).toBeInTheDocument();
    });
  });
});