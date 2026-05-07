type LatLng = {
  latitude: number;
  longitude: number;
};


export async function getLatLongWithLocalRequest(address: string): Promise<LatLng> {
    if (!address) throw new Error("Address is required");
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&limit=1`;
  
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AlphaBackend/1.0 (https://alpha.com; contact@alpha.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding service error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    
    // Check if response is likely JSON before parsing
    if (!text.trim().startsWith('[') && !text.trim().startsWith('{')) {
      throw new Error(`Invalid response from geocoding service: ${text.substring(0, 100)}`);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Failed to parse geocoding response: ${text.substring(0, 100)}`);
    }
  
    if (!data || !Array.isArray(data) || data.length === 0) throw new Error("Address not found");
  
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  }