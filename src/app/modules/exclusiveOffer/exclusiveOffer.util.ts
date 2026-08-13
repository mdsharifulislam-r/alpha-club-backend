type LatLng = {
  latitude: number;
  longitude: number;
};

const UA = 'AlphaBackend/1.0 (https://alpha.com; contact@alpha.com)';

function stripNonArabicLatin(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/\s*\u200E|\u200F\s*/g, ' ')
    .replace(/[|\\{}<>\[\]()"]+/g, ' ')
    .replace(/\s*-\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function nominatimSearch(q: string): Promise<LatLng | null> {
  if (!q) return null;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    q,
  )}&format=json&limit=1&addressdetails=0&accept-language=en`;

  const response = await fetch(url, {
    headers: { 'User-Agent': UA },
  });
  if (!response.ok) {
    throw new Error(`Geocoding service error: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  if (!text.trim().startsWith('[') && !text.trim().startsWith('{')) {
    throw new Error(`Invalid response from geocoding service: ${text.substring(0, 100)}`);
  }
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse geocoding response: ${text.substring(0, 100)}`);
  }
  if (!Array.isArray(data) || data.length === 0) return null;
  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { latitude: lat, longitude: lon };
}

export async function getLatLongWithLocalRequest(address: string): Promise<LatLng> {
  if (!address) throw new Error('Address is required');
  const clean = stripNonArabicLatin(address);
  if (!clean) throw new Error('Address is empty after normalization');

  // 1) original cleaned address
  let result = await nominatimSearch(clean);
  if (result) return result;

  // 2) drop the first line (shop/building name) and keep the location tail
  const commaParts = clean
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  for (let i = 1; i < commaParts.length; i++) {
    const tail = commaParts.slice(i).join(', ');
    result = await nominatimSearch(tail);
    if (result) return result;
  }

  // 3) keep only Arabic/Latin tokens that look place-like, as a last pass
  const tokens = clean
    .split(/[\s,،]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && /^[\p{L}\p{N}]+$/u.test(t));
  for (let len = tokens.length; len >= 2; len--) {
    const q = tokens.slice(0, len).join(' ');
    result = await nominatimSearch(q);
    if (result) return result;
  }

  throw new Error(
    "Unable to find coordinates for this address. Enter exact latitude/longitude in the form or simplify the address (e.g. 'Dubai Festival City, Dubai').",
  );
}