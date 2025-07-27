import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WinOverlay from '../components/WinOverlay';

describe('WinOverlay', () => {
  const mockOnNewGame = jest.fn();

  beforeEach(() => {
    mockOnNewGame.mockClear();
  });

  it('should not render when game is not won', () => {
    render(
      <WinOverlay
        isGameWon={false}
        moves={10}
        score={100}
        onNewGame={mockOnNewGame}
      />
    );

    expect(screen.queryByText('Congratulations!')).not.toBeInTheDocument();
  });

  it('should render win message when game is won', () => {
    render(
      <WinOverlay
        isGameWon={true}
        moves={25}
        score={150}
        onNewGame={mockOnNewGame}
      />
    );

    expect(screen.getByText('🎉 Congratulations! 🎉')).toBeInTheDocument();
    expect(screen.getByText('You won in 25 moves!')).toBeInTheDocument();
    expect(screen.getByText('Final Score: 150')).toBeInTheDocument();
    expect(screen.getByText('🎮 Play Again')).toBeInTheDocument();
  });

  it('should call onNewGame when play again button is clicked', () => {
    render(
      <WinOverlay
        isGameWon={true}
        moves={15}
        score={200}
        onNewGame={mockOnNewGame}
      />
    );

    const playAgainButton = screen.getByText('🎮 Play Again');
    fireEvent.click(playAgainButton);

    expect(mockOnNewGame).toHaveBeenCalledTimes(1);
  });
}); 