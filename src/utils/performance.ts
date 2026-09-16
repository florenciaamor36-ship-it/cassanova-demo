/**
 * Performance Optimization Engine for Cleopatra Slot Machine
 * Specifically tuned for low-end mobile devices (Android budget devices, older iPhones)
 * Maintains premium photorealistic aesthetics while drastically cutting GPU fill-rate and GC churn.
 */

export type PerformanceMode = 'auto' | 'high' | 'eco';

const PERF_STORAGE_KEY = 'cleopatra_slot_perf_mode';

class PerformanceManager {
  private mode: PerformanceMode = 'auto';
  private detectedLowEnd: boolean = false;
  private isMobileDevice: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PERF_STORAGE_KEY) as PerformanceMode | null;
      if (saved === 'high' || saved === 'eco' || saved === 'auto') {
        this.mode = saved;
      }
      this.detectHardware();
    }
  }

  private detectHardware() {
    if (typeof window === 'undefined') return;

    // Mobile screen / touch check
    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isSmallScreen = window.innerWidth <= 768;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.isMobileDevice = isMobileUA || (hasTouch && isSmallScreen);

    // CPU Cores (e.g. 4 or fewer cores indicates budget/older processor)
    const cores = navigator.hardwareConcurrency || 4;
    const isLowCores = cores <= 4;

    // RAM Memory (deviceMemory API in Chrome/Android)
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
    const isLowMemory = memory <= 3;

    // Low-end mobile detection
    this.detectedLowEnd = (this.isMobileDevice && (isLowCores || isLowMemory)) || (isMobileUA && isLowMemory);
  }

  public getMode(): PerformanceMode {
    return this.mode;
  }

  public setMode(mode: PerformanceMode) {
    this.mode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem(PERF_STORAGE_KEY, mode);
    }
  }

  public isLowEnd(): boolean {
    if (this.mode === 'eco') return true;
    if (this.mode === 'high') return false;
    return this.detectedLowEnd || (this.isMobileDevice && window.innerWidth < 640);
  }

  public isMobile(): boolean {
    return this.isMobileDevice;
  }

  /**
   * Optimized Device Pixel Ratio
   * High-end desktop: up to 1.5 - 2.0
   * Low-end mobile: clamped to 1.0 - 1.25.
   * On mobile screens with 300+ PPI, DPR 1.0-1.25 with CSS bilinear scaling looks identical
   * to human eyes, but saves up to 75% GPU fill-rate, avoiding thermal throttling and lag.
   */
  public getOptimizedDpr(): number {
    const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (this.isLowEnd()) {
      return Math.min(rawDpr, 1.0);
    }
    if (this.isMobileDevice) {
      return Math.min(rawDpr, 1.25);
    }
    return Math.min(rawDpr, 1.75);
  }

  /**
   * Adaptive particle count for WinCelebrationModal
   */
  public getCoinCount(variant: 'VARIANT_1' | 'VARIANT_2' | 'VARIANT_3'): number {
    const low = this.isLowEnd();
    if (variant === 'VARIANT_3') {
      return low ? 75 : this.isMobileDevice ? 110 : 210;
    }
    if (variant === 'VARIANT_2') {
      return low ? 48 : this.isMobileDevice ? 75 : 150;
    }
    return low ? 20 : 40;
  }

  public getSparkleCount(): number {
    return this.isLowEnd() ? 32 : this.isMobileDevice ? 50 : 85;
  }

  public getLightRaysCount(): number {
    return this.isLowEnd() ? 16 : 26;
  }

  /**
   * In 2D Canvas, ctx.shadowBlur runs a Gaussian convolution pass on every particle every frame.
   * On low-end mobile devices, this is the primary cause of stutter.
   */
  public shouldUseShadowBlur(): boolean {
    return !this.isLowEnd();
  }
}

export const perf = new PerformanceManager();
