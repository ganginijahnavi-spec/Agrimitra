export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string; // state
  admin2?: string; // district
}

// Open-Meteo geocoding API — free, no API key required.
export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error("Location search failed");
  }

  const data = (await response.json()) as { results?: GeocodingResult[] };
  return data.results ?? [];
}
