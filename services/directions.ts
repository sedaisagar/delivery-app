interface RoutePoint {
  latitude: number;
  longitude: number;
}

interface RouteResponse {
  points: RoutePoint[];
  distance: string;
  duration: string;
}

export class DirectionsService {
  private static API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key
  private static BASE_URL = 'https://maps.googleapis.com/maps/api/directions/json';

  static async getRoute(origin: RoutePoint, destination: RoutePoint): Promise<RouteResponse | null> {
    // For now, always use fallback route since API key is not configured
    // Uncomment the code below when you have a valid API key
    /*
    try {
      const url = `${this.BASE_URL}?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${this.API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        // Decode the polyline to get route points
        const points = this.decodePolyline(route.overview_polyline.points);
        
        return {
          points,
          distance: leg.distance.text,
          duration: leg.duration.text,
        };
      }
      
      return null;
    } catch (error) {
      console.log('Error fetching route:', error);
      return null;
    }
    */
    
    // Use fallback route for now
    return this.getFallbackRoute(origin, destination);
  }

  // Decode Google's polyline format to get coordinate points
  private static decodePolyline(encoded: string): RoutePoint[] {
    const points: RoutePoint[] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1E5,
        longitude: lng / 1E5,
      });
    }

    return points;
  }

  // Fallback method that creates a realistic curved route when API is not available
  static getFallbackRoute(origin: RoutePoint, destination: RoutePoint): RouteResponse {
    const points: RoutePoint[] = [];
    const steps = 30; // More points for smoother curve
    
    // Calculate midpoint for curve control
    const midLat = (origin.latitude + destination.latitude) / 2;
    const midLng = (origin.longitude + destination.longitude) / 2;
    
    // Add some offset to create a more realistic curve
    const latOffset = (destination.latitude - origin.latitude) * 0.1;
    const lngOffset = (destination.longitude - origin.longitude) * 0.1;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      
      // Use quadratic Bezier curve for smoother path
      const lat = origin.latitude * Math.pow(1 - t, 2) + 
                  (midLat + latOffset) * 2 * (1 - t) * t + 
                  destination.latitude * Math.pow(t, 2);
      
      const lng = origin.longitude * Math.pow(1 - t, 2) + 
                  (midLng + lngOffset) * 2 * (1 - t) * t + 
                  destination.longitude * Math.pow(t, 2);
      
      points.push({
        latitude: lat,
        longitude: lng,
      });
    }

    // Calculate approximate distance
    const distance = this.calculateDistance(origin, destination);
    
    return {
      points,
      distance: `${distance.toFixed(1)} km`,
      duration: `${Math.ceil(distance * 2)} min`, // Rough estimate
    };
  }

  private static calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLng = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
} 