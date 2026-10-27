/**
 * Utility for safe Meta Pixel event tracking without PII
 */
export function trackPixelEvent(eventName, params = {}) {
  if (typeof window !== 'undefined') {
    // If it's a direct user interaction/conversion event (Lead, Schedule, Contact),
    // ensure pixel script is loaded immediately so the event isn't lost on redirect/navigation.
    const isConversionOrAction = ['Lead', 'Schedule', 'Contact'].includes(eventName);
    if (isConversionOrAction && typeof window.__loadFbPixel === 'function') {
      window.__loadFbPixel();
    }

    if (typeof window.fbq === 'function') {
      if (params && Object.keys(params).length > 0) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('track', eventName);
      }
    }
  }
}
