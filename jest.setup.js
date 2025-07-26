import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => require('next-router-mock'))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createBuffer: jest.fn(),
  createBufferSource: jest.fn(() => ({
    buffer: null,
    connect: jest.fn(),
    start: jest.fn(),
  })),
  createGain: jest.fn(() => ({
    gain: {
      setValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
  })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
}))

// Mock webkitAudioContext
global.webkitAudioContext = global.AudioContext