/**
 * Mobile Haptic Feedback helper
 * Uses the standard navigator.vibrate Web API safely with fallbacks
 */
export const haptic = {
  // Light tap for regular buttons and bet changes (10ms)
  light: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(12);
      }
    } catch {
      // Ignored in unsupported browsers or if permissions blocked
    }
  },

  // Reel spin initiation (18ms)
  spin: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(18);
      }
    } catch {
      // Ignored
    }
  },

  // Standard win celebration pulse
  win: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 40, 40]);
      }
    } catch {
      // Ignored
    }
  },

  // Major/Mega win or Free spins feature trigger
  bigWin: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 50, 90, 50, 120]);
      }
    } catch {
      // Ignored
    }
  },

  // Scatter landing tease
  scatter: () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([35, 30, 45]);
      }
    } catch {
      // Ignored
    }
  },
};
