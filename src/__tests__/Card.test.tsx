import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../components/Card';

// Mock the card dimensions utility
jest.mock('../utils/cardDimensions', () => ({
  getCardDimensions: () => ({
    width: 52,
    height: 72,
    widthPx: '52px',
    heightPx: '72px',
    aspectRatio: 52 / 72
  }),
  getCardFontSizes: () => ({
    base: '0.9rem',
    rank: '1.4rem',
    suitSymbol: '2.8rem',
    faceDown: '1.5rem'
  })
}));

describe('Card Component', () => {
  const defaultProps = {
    id: '1-hearts',
    rank: 1,
    suit: 'hearts' as const,
    faceUp: true,
    onClick: jest.fn(),
    onDragStart: jest.fn(),
    isSelected: false,
    isDragging: false,
    isHighlighted: false,
    className: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render face-up card correctly', () => {
    render(<Card {...defaultProps} />);
    
    expect(screen.getByTestId('card-1-hearts')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('♥')).toBeInTheDocument();
  });

  it('should render face-down card correctly', () => {
    render(<Card {...defaultProps} faceUp={false} />);
    
    expect(screen.getByTestId('card-1-hearts')).toBeInTheDocument();
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.queryByText('♥')).not.toBeInTheDocument();
  });

  it('should render different ranks correctly', () => {
    const { rerender } = render(<Card {...defaultProps} rank={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();

    rerender(<Card {...defaultProps} rank={11} />);
    expect(screen.getByText('J')).toBeInTheDocument();

    rerender(<Card {...defaultProps} rank={12} />);
    expect(screen.getByText('Q')).toBeInTheDocument();

    rerender(<Card {...defaultProps} rank={13} />);
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('should render different suits correctly', () => {
    const { rerender } = render(<Card {...defaultProps} suit="diamonds" />);
    expect(screen.getByText('♦')).toBeInTheDocument();

    rerender(<Card {...defaultProps} suit="clubs" />);
    expect(screen.getByText('♣')).toBeInTheDocument();

    rerender(<Card {...defaultProps} suit="spades" />);
    expect(screen.getByText('♠')).toBeInTheDocument();
  });

  it('should apply selected class when isSelected is true', () => {
    render(<Card {...defaultProps} isSelected={true} />);
    
    const card = screen.getByTestId('card-1-hearts');
    expect(card).toHaveClass('selected');
  });

  it('should apply dragging class when isDragging is true', () => {
    render(<Card {...defaultProps} isDragging={true} />);
    
    const card = screen.getByTestId('card-1-hearts');
    expect(card).toHaveClass('dragging');
  });

  it('should apply highlighted class when isHighlighted is true', () => {
    render(<Card {...defaultProps} isHighlighted={true} />);
    
    const card = screen.getByTestId('card-1-hearts');
    expect(card).toHaveClass('highlighted');
  });

  it('should call onClick when card is clicked', () => {
    const onClick = jest.fn();
    render(<Card {...defaultProps} onClick={onClick} />);
    
    const card = screen.getByTestId('card-1-hearts');
    card.click();
    
    expect(onClick).toHaveBeenCalledWith('1-hearts');
  });

  it('should call onDragStart when drag starts', () => {
    const onDragStart = jest.fn();
    render(<Card {...defaultProps} onDragStart={onDragStart} />);
    
    const card = screen.getByTestId('card-1-hearts');
    const mockEvent = new MouseEvent('mousedown', { button: 0 });
    
    card.dispatchEvent(mockEvent);
    
    expect(onDragStart).toHaveBeenCalled();
  });

  it('should not call onDragStart for right-click', () => {
    const onDragStart = jest.fn();
    render(<Card {...defaultProps} onDragStart={onDragStart} />);
    
    const card = screen.getByTestId('card-1-hearts');
    const mockEvent = new MouseEvent('mousedown', { button: 2 });
    
    card.dispatchEvent(mockEvent);
    
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Card {...defaultProps} className="custom-class" />);
    
    const card = screen.getByTestId('card-1-hearts');
    expect(card).toHaveClass('custom-class');
  });

  it('should render red cards with red color', () => {
    const { rerender } = render(<Card {...defaultProps} suit="hearts" />);
    expect(screen.getByText('♥')).toHaveClass('red');

    rerender(<Card {...defaultProps} suit="diamonds" />);
    expect(screen.getByText('♦')).toHaveClass('red');
  });

  it('should render black cards with black color', () => {
    const { rerender } = render(<Card {...defaultProps} suit="clubs" />);
    expect(screen.getByText('♣')).toHaveClass('black');

    rerender(<Card {...defaultProps} suit="spades" />);
    expect(screen.getByText('♠')).toHaveClass('black');
  });

  it('should handle touch events for mobile', () => {
    const onDragStart = jest.fn();
    render(<Card {...defaultProps} onDragStart={onDragStart} />);
    
    const card = screen.getByTestId('card-1-hearts');
    const mockTouchEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 200 }] as any
    });
    
    card.dispatchEvent(mockTouchEvent);
    
    expect(onDragStart).toHaveBeenCalled();
  });

  it('should prevent default on context menu', () => {
    render(<Card {...defaultProps} />);
    
    const card = screen.getByTestId('card-1-hearts');
    const mockEvent = new MouseEvent('contextmenu');
    const preventDefaultSpy = jest.spyOn(mockEvent, 'preventDefault');
    
    card.dispatchEvent(mockEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
}); 