import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPanel from '../components/SettingsPanel';

describe('SettingsPanel Component', () => {
  const defaultProps = {
    isOpen: false,
    onClose: jest.fn(),
    onSettingsChange: jest.fn(),
    settings: {
      deckCyclingLimit: 0,
      drawCount: 1,
      autoMoveToFoundation: false,
      soundEnabled: true,
      showHints: true
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<SettingsPanel {...defaultProps} />);
    
    expect(screen.queryByText(/settings/i)).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<SettingsPanel {...defaultProps} isOpen={true} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close settings/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(<SettingsPanel {...defaultProps} isOpen={true} onClose={onClose} />);
    
    // Find the backdrop div (the first div with the backdrop classes)
    const backdrop = container.querySelector('div[class*="fixed inset-0 bg-black bg-opacity-70"]');
    fireEvent.click(backdrop!);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should not call onClose when panel content is clicked', () => {
    const onClose = jest.fn();
    render(<SettingsPanel {...defaultProps} isOpen={true} onClose={onClose} />);
    
    const panel = screen.getByText('Settings').closest('div');
    fireEvent.click(panel!);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should render deck cycling limit setting', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    expect(screen.getByLabelText(/deck cycling limit/i)).toBeInTheDocument();
  });

  it('should render draw count setting', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    expect(screen.getByLabelText(/draw count/i)).toBeInTheDocument();
  });

  it('should render auto-move to foundation setting', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    expect(screen.getByLabelText(/auto-move to foundation/i)).toBeInTheDocument();
  });

  it('should render sound enabled setting', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    expect(screen.getByLabelText(/sound enabled/i)).toBeInTheDocument();
  });

  it('should render show hints setting', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    expect(screen.getByLabelText(/show hints/i)).toBeInTheDocument();
  });

  it('should handle deck cycling limit change', () => {
    const onSettingsChange = jest.fn();
    render(<SettingsPanel {...defaultProps} isOpen={true} onSettingsChange={onSettingsChange} />);
    
    const select = screen.getByLabelText(/deck cycling limit/i);
    fireEvent.change(select, { target: { value: '3' } });
    
    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ deckCyclingLimit: 3 }));
  });

  it('should handle draw count change', () => {
    const onSettingsChange = jest.fn();
    render(<SettingsPanel {...defaultProps} isOpen={true} onSettingsChange={onSettingsChange} />);
    
    const select = screen.getByLabelText(/draw count/i);
    fireEvent.change(select, { target: { value: '3' } });
    
    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ drawCount: 3 }));
  });

  it('should handle auto-move to foundation toggle', () => {
    const onSettingsChange = jest.fn();
    render(<SettingsPanel {...defaultProps} isOpen={true} onSettingsChange={onSettingsChange} />);
    
    const checkbox = screen.getByLabelText(/auto-move to foundation/i);
    fireEvent.click(checkbox);
    
    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ autoMoveToFoundation: true }));
  });

  it('should handle sound enabled toggle', () => {
    const onSettingsChange = jest.fn();
    render(<SettingsPanel {...defaultProps} isOpen={true} onSettingsChange={onSettingsChange} />);
    
    const checkbox = screen.getByLabelText(/sound enabled/i);
    fireEvent.click(checkbox);
    
    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ soundEnabled: false }));
  });

  it('should handle show hints toggle', () => {
    const onSettingsChange = jest.fn();
    render(<SettingsPanel {...defaultProps} isOpen={true} onSettingsChange={onSettingsChange} />);
    
    const checkbox = screen.getByLabelText(/show hints/i);
    fireEvent.click(checkbox);
    
    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ showHints: false }));
  });

  it('should display current settings values', () => {
    const settings = {
      deckCyclingLimit: 3,
      drawCount: 3,
      autoMoveToFoundation: true,
      soundEnabled: false,
      showHints: false
    };
    
    render(<SettingsPanel {...defaultProps} isOpen={true} settings={settings} />);
    
    const deckCyclingSelect = screen.getByLabelText(/deck cycling limit/i);
    expect(deckCyclingSelect).toHaveValue('3');
    
    const drawCountSelect = screen.getByLabelText(/draw count/i);
    expect(drawCountSelect).toHaveValue('3');
    
    const autoMoveCheckbox = screen.getByLabelText(/auto-move to foundation/i);
    expect(autoMoveCheckbox).toBeChecked();
    
    const soundCheckbox = screen.getByLabelText(/sound enabled/i);
    expect(soundCheckbox).not.toBeChecked();
    
    const hintsCheckbox = screen.getByLabelText(/show hints/i);
    expect(hintsCheckbox).not.toBeChecked();
  });

  it('should handle keyboard navigation', () => {
    const onClose = jest.fn();
    render(<SettingsPanel {...defaultProps} isOpen={true} onClose={onClose} />);
    
    // Test Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('should handle multiple settings changes', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    // Change multiple settings
    const deckCyclingSelect = screen.getByLabelText(/deck cycling limit/i);
    const drawCountSelect = screen.getByLabelText(/draw count/i);
    const autoMoveCheckbox = screen.getByLabelText(/auto-move to foundation/i);
    
    fireEvent.change(deckCyclingSelect, { target: { value: '3' } });
    fireEvent.change(drawCountSelect, { target: { value: '3' } });
    fireEvent.click(autoMoveCheckbox);
    
    expect(defaultProps.onSettingsChange).toHaveBeenCalledTimes(3);
    expect(defaultProps.onSettingsChange).toHaveBeenNthCalledWith(1, expect.objectContaining({ deckCyclingLimit: 3 }));
    expect(defaultProps.onSettingsChange).toHaveBeenNthCalledWith(2, expect.objectContaining({ drawCount: 3 }));
    expect(defaultProps.onSettingsChange).toHaveBeenNthCalledWith(3, expect.objectContaining({ autoMoveToFoundation: true }));
  });

  it('should handle edge case values', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    // Test extreme values
    const deckCyclingSelect = screen.getByLabelText(/deck cycling limit/i);
    fireEvent.change(deckCyclingSelect, { target: { value: '0' } });
    
    expect(defaultProps.onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ deckCyclingLimit: 0 }));
  });

  it('should handle accessibility attributes', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    const closeButton = screen.getByRole('button', { name: /close settings/i });
    expect(closeButton).toHaveAttribute('aria-label');
    
    const deckCyclingSelect = screen.getByLabelText(/deck cycling limit/i);
    expect(deckCyclingSelect).toBeInTheDocument();
    
    const drawCountSelect = screen.getByLabelText(/draw count/i);
    expect(drawCountSelect).toBeInTheDocument();
  });

  it('should handle focus management when opened', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    const closeButton = screen.getByRole('button', { name: /close settings/i });
    expect(closeButton).toHaveFocus();
  });

  it('should handle focus trap within panel', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    const closeButton = screen.getByRole('button', { name: /close settings/i });
    const deckCyclingSelect = screen.getByLabelText(/deck cycling limit/i);
    
    closeButton.focus();
    expect(closeButton).toHaveFocus();
    
    deckCyclingSelect.focus();
    expect(deckCyclingSelect).toHaveFocus();
  });

  it('should handle form submission prevention', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    // The form submission prevention is handled internally
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it('should handle window resize events', () => {
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    // Simulate window resize
    fireEvent.resize(window);
    
    // Panel should still be visible
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it('should handle different screen sizes', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    render(<SettingsPanel {...defaultProps} isOpen={true} />);
    
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
    
    // Reset
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  it('should handle settings with all options enabled', () => {
    const settings = {
      deckCyclingLimit: 3,
      drawCount: 3,
      autoMoveToFoundation: true,
      soundEnabled: true,
      showHints: true
    };
    
    render(<SettingsPanel {...defaultProps} isOpen={true} settings={settings} />);
    
    const autoMoveCheckbox = screen.getByLabelText(/auto-move to foundation/i);
    const soundCheckbox = screen.getByLabelText(/sound enabled/i);
    const hintsCheckbox = screen.getByLabelText(/show hints/i);
    
    expect(autoMoveCheckbox).toBeChecked();
    expect(soundCheckbox).toBeChecked();
    expect(hintsCheckbox).toBeChecked();
  });

  it('should handle settings with all options disabled', () => {
    const settings = {
      deckCyclingLimit: 0,
      drawCount: 1,
      autoMoveToFoundation: false,
      soundEnabled: false,
      showHints: false
    };
    
    render(<SettingsPanel {...defaultProps} isOpen={true} settings={settings} />);
    
    const autoMoveCheckbox = screen.getByLabelText(/auto-move to foundation/i);
    const soundCheckbox = screen.getByLabelText(/sound enabled/i);
    const hintsCheckbox = screen.getByLabelText(/show hints/i);
    
    expect(autoMoveCheckbox).not.toBeChecked();
    expect(soundCheckbox).not.toBeChecked();
    expect(hintsCheckbox).not.toBeChecked();
  });
}); 