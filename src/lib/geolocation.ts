/**
 * Enhanced geolocation utilities with fallback mechanisms
 * Addresses the issue of client-side geolocation being inaccurate or blocked
 */

/**
 * Get user's location with multiple fallback methods
 * 1. Browser geolocation API
 * 2. IP-based geolocation service
 * 3. Manual location override
 */
export async function getUserLocation(
  options: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
): Promise<{ lat: number; lng: number } | null> {
  // First, try browser geolocation
  const browserLocation = await getBrowserLocation(options);
  if (browserLocation) {
    return browserLocation;
  }

  // Fallback to IP-based geolocation
  const ipLocation = await getIPLocation();
  if (ipLocation) {
    return ipLocation;
  }

  // If both methods fail, return null
  return null;
}

/**
 * Get location using browser's geolocation API
 */
function getBrowserLocation(options: PositionOptions): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Error getting browser location:', error.message);
        resolve(null);
      },
      options
    );
  });
}

/**
 * Get location based on IP address
 * Uses a free IP geolocation service as fallback
 */
async function getIPLocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    // Using ipapi.co service (free tier available)
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error(`IP location request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lng: data.longitude
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Error getting IP-based location:', error);
    return null;
  }
}

/**
 * Validate coordinates to ensure they're reasonable
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}