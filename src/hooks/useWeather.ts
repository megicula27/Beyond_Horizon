import { useQuery } from "@tanstack/react-query";
import { fetchCurrentWeather, type WeatherData } from "../services/weatherService";

// Default: mid-Atlantic vessel position
const DEFAULT_LAT = 25.2;
const DEFAULT_LON = -71.5;

export function useWeather(lat = DEFAULT_LAT, lon = DEFAULT_LON) {
  return useQuery<WeatherData>({
    queryKey: ["weather", lat, lon],
    queryFn: () => fetchCurrentWeather(lat, lon),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider stale after 4 minutes
    retry: 2,
  });
}
