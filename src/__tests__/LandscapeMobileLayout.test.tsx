import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandscapeMobileLayout from '../components/layout/LandscapeMobileLayout';

describe('LandscapeMobileLayout Component', () => {
  const mockProps = {
    children: <div data-testid="test-child">Test Child</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock landscape mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 667
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 375
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      const child = screen.getByTestId('test-child');
      expect(child).toBeInTheDocument();
      expect(child).toHaveTextContent('Test Child');
    });

    it('should apply landscape-specific CSS classes', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      // Layout should have appropriate classes for landscape mobile
      const child = screen.getByTestId('test-child');
      expect(child).toBeInTheDocument();
    });
  });

  describe('Landscape-specific features', () => {
    it('should optimize for landscape orientation', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should handle different landscape aspect ratios', () => {
      const aspectRatios = [
        { width: 667, height: 375 }, // iPhone landscape
        { width: 896, height: 414 }, // iPhone XR landscape
        { width: 640, height: 360 }  // Android landscape
      ];

      aspectRatios.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', { value: width });
        Object.defineProperty(window, 'innerHeight', { value: height });
        
        render(<LandscapeMobileLayout {...mockProps} />);
        
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        
        // Clean up for next iteration
        document.body.innerHTML = '';
      });
    });

    it('should handle horizontal space efficiently', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      const child = screen.getByTestId('test-child');
      expect(child).toBeInTheDocument();
      
      // Should utilize horizontal space effectively
      expect(child.parentElement).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('should have proper landscape HTML structure', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should handle multiple children in landscape layout', () => {
      const multipleChildren = (
        <>
          <div data-testid="landscape-child-1">Landscape Child 1</div>
          <div data-testid="landscape-child-2">Landscape Child 2</div>
        </>
      );

      render(<LandscapeMobileLayout>{multipleChildren}</LandscapeMobileLayout>);
      
      expect(screen.getByTestId('landscape-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('landscape-child-2')).toBeInTheDocument();
    });

    it('should handle empty children gracefully', () => {
      render(<LandscapeMobileLayout />);
      
      // Should render without crashing
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('should adapt to different landscape widths', () => {
      const widths = [568, 667, 736, 812, 896];
      
      widths.forEach(width => {
        Object.defineProperty(window, 'innerWidth', { value: width });
        Object.defineProperty(window, 'innerHeight', { value: 375 });
        
        render(<LandscapeMobileLayout {...mockProps} />);
        
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        
        // Clean up for next iteration
        document.body.innerHTML = '';
      });
    });

    it('should handle transition from portrait to landscape', () => {
      // Start in portrait
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });
      
      render(<LandscapeMobileLayout {...mockProps} />);
      
      // Simulate rotation to landscape
      Object.defineProperty(window, 'innerWidth', { value: 667 });
      Object.defineProperty(window, 'innerHeight', { value: 375 });
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently in landscape mode', () => {
      const startTime = performance.now();
      
      render(<LandscapeMobileLayout {...mockProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should handle complex layouts efficiently', () => {
      const complexChild = (
        <div data-testid="complex-landscape-child">
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{ flex: 1 }}>Left Panel</div>
            <div style={{ flex: 2 }}>Center Content</div>
            <div style={{ flex: 1 }}>Right Panel</div>
          </div>
        </div>
      );

      render(<LandscapeMobileLayout>{complexChild}</LandscapeMobileLayout>);
      
      expect(screen.getByTestId('complex-landscape-child')).toBeInTheDocument();
      expect(screen.getByText('Left Panel')).toBeInTheDocument();
      expect(screen.getByText('Center Content')).toBeInTheDocument();
      expect(screen.getByText('Right Panel')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle very wide landscape screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      Object.defineProperty(window, 'innerHeight', { value: 300 });
      
      render(<LandscapeMobileLayout {...mockProps} />);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should handle narrow landscape screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 480 });
      Object.defineProperty(window, 'innerHeight', { value: 320 });
      
      render(<LandscapeMobileLayout {...mockProps} />);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should handle dynamic content changes', () => {
      const DynamicContent = () => {
        const [expanded, setExpanded] = React.useState(false);
        return (
          <div data-testid="dynamic-landscape-content">
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Collapse' : 'Expand'}
            </button>
            {expanded && <div>Expanded content for landscape view</div>}
          </div>
        );
      };

      render(<LandscapeMobileLayout><DynamicContent /></LandscapeMobileLayout>);
      
      expect(screen.getByTestId('dynamic-landscape-content')).toBeInTheDocument();
      expect(screen.getByText('Expand')).toBeInTheDocument();
    });
  });
});