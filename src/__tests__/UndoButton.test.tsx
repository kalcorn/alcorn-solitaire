import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UndoButton from '../components/UndoButton';

describe('UndoButton Component', () => {
  const defaultProps = {
    onUndo: jest.fn(),
    canUndo: false,
    className: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render undo button', () => {
    render(<UndoButton {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
  });

  it('should be disabled when canUndo is false', () => {
    render(<UndoButton {...defaultProps} canUndo={false} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    expect(button).toBeDisabled();
  });

  it('should be enabled when canUndo is true', () => {
    render(<UndoButton {...defaultProps} canUndo={true} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    expect(button).not.toBeDisabled();
  });

  it('should call onUndo when clicked and enabled', () => {
    const onUndo = jest.fn();
    render(<UndoButton {...defaultProps} onUndo={onUndo} canUndo={true} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(button);
    
    expect(onUndo).toHaveBeenCalled();
  });

  it('should not call onUndo when clicked and disabled', () => {
    const onUndo = jest.fn();
    render(<UndoButton {...defaultProps} onUndo={onUndo} canUndo={false} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(button);
    
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<UndoButton {...defaultProps} className="custom-class" />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    render(<UndoButton {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title');
  });

  it('should handle keyboard events', () => {
    const onUndo = jest.fn();
    render(<UndoButton {...defaultProps} onUndo={onUndo} canUndo={true} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onUndo).toHaveBeenCalled();
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(onUndo).toHaveBeenCalledTimes(2);
  });

  it('should not handle keyboard events when disabled', () => {
    const onUndo = jest.fn();
    render(<UndoButton {...defaultProps} onUndo={onUndo} canUndo={false} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(onUndo).not.toHaveBeenCalled();
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('should handle focus events', () => {
    const onUndo = jest.fn();
    render(<UndoButton onUndo={onUndo} canUndo={true} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    button.focus();
    
    expect(button).toHaveFocus();
  });

  it('should handle mouse events', () => {
    const onUndo = jest.fn();
    render(<UndoButton {...defaultProps} onUndo={onUndo} canUndo={true} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    
    // Test mouse down
    fireEvent.mouseDown(button);
    expect(button).toBeInTheDocument();
    
    // Test mouse up
    fireEvent.mouseUp(button);
    expect(button).toBeInTheDocument();
  });

  it('should handle touch events', () => {
    const onUndo = jest.fn();
    render(<UndoButton {...defaultProps} onUndo={onUndo} canUndo={true} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    
    // Test touch start
    fireEvent.touchStart(button);
    expect(button).toBeInTheDocument();
    
    // Test touch end
    fireEvent.touchEnd(button);
    expect(button).toBeInTheDocument();
  });

  it('should handle multiple rapid clicks', () => {
    const onUndo = jest.fn();
    render(<UndoButton {...defaultProps} onUndo={onUndo} canUndo={true} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    
    // Rapid clicks
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(onUndo).toHaveBeenCalledTimes(3);
  });

  it('should handle undefined onUndo prop', () => {
    render(<UndoButton {...defaultProps} onUndo={undefined as any} canUndo={true} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(button);
    
    // Should not throw an error
    expect(button).toBeInTheDocument();
  });

  it('should handle null onUndo prop', () => {
    render(<UndoButton {...defaultProps} onUndo={null as any} canUndo={true} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(button);
    
    // Should not throw an error
    expect(button).toBeInTheDocument();
  });

  it('should handle edge case with very long className', () => {
    const longClassName = 'a'.repeat(1000);
    render(<UndoButton {...defaultProps} className={longClassName} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    expect(button).toHaveClass(longClassName);
  });

  it('should handle empty className', () => {
    render(<UndoButton {...defaultProps} className="" />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle undefined className', () => {
    render(<UndoButton {...defaultProps} className={undefined as any} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle null className', () => {
    render(<UndoButton {...defaultProps} className={null as any} />);
    
    const button = screen.getByRole('button', { name: /undo/i });
    expect(button).toBeInTheDocument();
  });
}); 