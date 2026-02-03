/**
 * Server-side time utility to avoid client device time issues
 * This provides a way to get accurate server time for business hours calculations
 */

// Cache the time offset between server and client
let timeOffset = 0;
let lastSync = 0;

/**
 * Calculate the time difference between server and client
 */
async function syncServerTime(): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Make a request to get server timestamp
    // Using a simple fetch to /api/time endpoint or just getting current server time via headers
    const response = await fetch('/api/time', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (response.ok) {
      const serverTime = await response.json();
      const endTime = Date.now();
      
      // Calculate round-trip time
      const roundTripTime = endTime - startTime;
      // Estimate server time when our request arrived
      const estimatedServerTime = serverTime.timestamp + Math.floor(roundTripTime / 2);
      
      // Update time offset
      timeOffset = estimatedServerTime - endTime;
      lastSync = endTime;
    }
  } catch (error) {
    // Fallback to using current client time if server time isn't available
    console.warn('Could not sync with server time, using client time:', error);
  }
}

/**
 * Get current time adjusted with server offset
 */
export function getCurrentServerTime(): Date {
  // Sync time if it's been more than 5 minutes since last sync
  if (Date.now() - lastSync > 5 * 60 * 1000) {
    syncServerTime();
  }
  
  const clientTime = new Date();
  return new Date(clientTime.getTime() + timeOffset);
}

/**
 * Alternative implementation: Use server time from document or meta tags if available
 * This is useful when server renders initial page with its timestamp
 */
export function getServerTimeFromPage(): Date | null {
  // Look for server timestamp in page metadata
  const serverTimeElement = document.querySelector('meta[name="server-time"]');
  if (serverTimeElement) {
    const timestamp = serverTimeElement.getAttribute('content');
    if (timestamp) {
      return new Date(Number(timestamp));
    }
  }
  
  // Alternative: check for data attribute on body or html element
  const serverTimeAttr = document.documentElement.getAttribute('data-server-time');
  if (serverTimeAttr) {
    return new Date(Number(serverTimeAttr));
  }
  
  return null;
}

/**
 * Get current time using either server-synced time or client time
 */
export function getCurrentTime(): Date {
  const serverTimeFromPage = getServerTimeFromPage();
  if (serverTimeFromPage) {
    // If page has server time, adjust based on elapsed time since page load
    const loadTime = (window as any).__startTime || Date.now();
    const elapsed = Date.now() - loadTime;
    return new Date(serverTimeFromPage.getTime() + elapsed);
  }
  
  // Fall back to server-synced time or client time
  return getCurrentServerTime();
}