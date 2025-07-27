import '@testing-library/jest-dom';

// Mock fetch for tests
global.fetch = jest.fn();

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createBufferSource: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn() },
  }),
  createBuffer: jest.fn().mockReturnValue({
    getChannelData: jest.fn().mockReturnValue(new Float32Array(44100)),
    length: 44100,
    duration: 1,
    numberOfChannels: 1,
    sampleRate: 44100,
  }),
  decodeAudioData: jest.fn().mockResolvedValue({
    getChannelData: jest.fn().mockReturnValue(new Float32Array(44100)),
    length: 44100,
    duration: 1,
    numberOfChannels: 1,
    sampleRate: 44100,
  }),
  destination: {
    connect: jest.fn(),
  },
  currentTime: 0,
  sampleRate: 44100,
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
}));

// Mock Web Audio API
global.AudioBuffer = jest.fn().mockImplementation(() => ({
  getChannelData: jest.fn().mockReturnValue(new Float32Array(44100)),
  length: 44100,
  duration: 1,
  numberOfChannels: 1,
  sampleRate: 44100,
}));

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
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
  x: 0,
  y: 0,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;