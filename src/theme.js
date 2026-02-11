/**
 * Theme configuration for the Space-Nerd Portfolio
 * Centralizes colors, shadows, and common styles to avoid duplication
 */

export const COLORS = {
  // Matrix/Terminal Green Theme
  matrix: '#00ff99',
  matrixRgba: 'rgba(0, 255, 150, 0.3)',
  matrixRgbaLight: 'rgba(0, 255, 150, 0.4)',
  matrixRgbaFaint: 'rgba(0, 255, 100, 0.05)',
  matrixRgbaMid: 'rgba(0, 255, 100, 0.15)',
  
  // Space Blue Theme
  spaceBlue: '#00bfff',
  spaceBlueFaint: '#00bfff55',
  spaceBlueGlow: '#00bfff88',
  spaceBlueDeep: '#0077ff44',
  
  // Background
  dark: '#000000',
  darkGray: '#111111',
  mediumGray: '#1a1a1a',
  
  // Text
  white: '#ffffff',
  lightGray: '#cccccc',
};

export const SHADOWS = {
  // Glow effects
  matrixGlow: '0 0 12px #00ff99',
  matrixGlowMedium: '0 0 10px rgba(0, 255, 150, 0.4)',
  spaceGlow: '0 0 10px #00bfff88, 0 0 30px #0077ff44',
  spaceGlowMedium: '0 0 20px #00bfff55',
  spaceGlowStrong: '0 0 100px #00bfff88',
  
  // Standard shadows
  standard: '0 0 12px rgba(0, 0, 0, 0.4)',
};

export const BORDERS = {
  matrix: `1px solid ${COLORS.matrixRgba}`,
  matrixSolid: `1px solid ${COLORS.matrix}`,
  spaceBlue: `1px solid ${COLORS.spaceBlueFaint}`,
};

/**
 * Common button styles with matrix theme
 */
export const BUTTON_STYLES = {
  matrix: {
    color: COLORS.matrix,
    border: BORDERS.matrix,
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  matrixHover: {
    borderColor: COLORS.matrix,
    boxShadow: SHADOWS.matrixGlowMedium,
  },
  matrixActive: {
    background: COLORS.matrix,
    color: COLORS.dark,
  },
};

/**
 * Common animation keyframes as CSS strings
 */
export const ANIMATIONS = {
  pulse: `
    @keyframes pulse {
      0% { background-color: rgba(0, 255, 100, 0.05); }
      50% { background-color: rgba(0, 255, 100, 0.15); }
      100% { background-color: rgba(0, 255, 100, 0.05); }
    }
  `,
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
};

/**
 * API configuration
 */
export const API_CONFIG = {
  aiProxyEndpoint: 'https://gh-ai-proxy.omer-mnsu.workers.dev/AI/ask',
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
};
