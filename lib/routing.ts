/**
 * Get route from OSRM (Open Source Routing Machine)
 * This will return a route that follows roads, similar to Google Maps
 */
export async function getRouteFromOSRM(
  start: [number, number], // [lng, lat]
  end: [number, number]    // [lng, lat]
): Promise<number[][] | null> {
  try {
    // OSRM API endpoint
    // Format: lon1,lat1;lon2,lat2
    const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('OSRM API error:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('OSRM route not found');
      return null;
    }
    
    // Extract coordinates from GeoJSON geometry
    const geometry = data.routes[0].geometry;
    if (geometry.type === 'LineString' && geometry.coordinates) {
      // OSRM returns coordinates as [lng, lat]
      return geometry.coordinates as number[][];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching route from OSRM:', error);
    return null;
  }
}

/**
 * Get route for multiple waypoints
 */
export async function getRouteWithWaypoints(
  waypoints: [number, number][] // Array of [lng, lat]
): Promise<number[][] | null> {
  if (waypoints.length < 2) return null;
  
  try {
    // OSRM API endpoint for multiple waypoints
    // Use overview=full for detailed geometry that follows roads accurately
    const coordinates = waypoints.map(wp => `${wp[0]},${wp[1]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('OSRM API error:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('OSRM route not found for waypoints:', waypoints.length);
      return null;
    }
    
    // Extract coordinates from GeoJSON geometry
    const geometry = data.routes[0].geometry;
    if (geometry.type === 'LineString' && geometry.coordinates) {
      const coords = geometry.coordinates as number[][];
      
      // Validate that we got a reasonable route (at least 2 points)
      if (coords.length < 2) {
        console.warn('OSRM returned route with less than 2 points');
        return null;
      }
      
      return coords;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching route from OSRM:', error);
    return null;
  }
}
