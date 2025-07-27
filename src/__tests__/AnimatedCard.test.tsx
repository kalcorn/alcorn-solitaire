import React from 'react';
import { render } from '@testing-library/react';
import AnimatedCard from '../components/AnimatedCard';
import { Card as CardType } from '../types';

// Mock the Card component
jest.mock('../components/Card', () => {
  return function MockCard({ suit, rank, faceUp }: { suit: string; rank: number; faceUp: boolean }) {
    return <div data-testid={`card-${suit}-${rank}-${faceUp}`}>Mock Card</div>;
  };
});

describe('AnimatedCard', () => {
  const mockCard: CardType = {
    id: 'hearts-7',
    suit: 'hearts',
    rank: 7,
    faceUp: true,
  };

  it('should not render when animatingCard is null', () => {
    const { container } = render(<AnimatedCard animatingCard={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when startPosition is missing', () => {
    const animatingCard = {
      card: mockCard,
      type: 'stockToWaste' as const,
      endPosition: { x: 100, y: 100 },
    };

    const { container } = render(<AnimatedCard animatingCard={animatingCard} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when endPosition is missing', () => {
    const animatingCard = {
      card: mockCard,
      type: 'stockToWaste' as const,
      startPosition: { x: 0, y: 0 },
    };

    const { container } = render(<AnimatedCard animatingCard={animatingCard} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render animated card with correct props', () => {
    const animatingCard = {
      card: mockCard,
      type: 'stockToWaste' as const,
      startPosition: { x: 0, y: 0 },
      endPosition: { x: 100, y: 100 },
      isLandscapeMobile: false,
    };

    const { container } = render(<AnimatedCard animatingCard={animatingCard} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render animated card with landscape mobile size', () => {
    const animatingCard = {
      card: mockCard,
      type: 'wasteToStock' as const,
      startPosition: { x: 0, y: 0 },
      endPosition: { x: 100, y: 100 },
      isLandscapeMobile: true,
    };

    const { container } = render(<AnimatedCard animatingCard={animatingCard} />);
    expect(container.firstChild).toBeInTheDocument();
  });
}); 