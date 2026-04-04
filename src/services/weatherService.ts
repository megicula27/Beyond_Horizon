import axios from "axios";

export interface WeatherData {
  humidity: number;
  windSpeed: number; // in knots
  windDirection: string; // e.g., "NW"
  temperature: number;
}

// Convert degrees to compass direction
function degreesToCompass(deg: number): string {
  const directions = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW",
  ];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index]!;
}

// Convert km/h to knots
function kmhToKnots(kmh: number): number {
  return Math.round(kmh * 0.539957);
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast`;

  const res = await axios.get(url, {
    params: {
      latitude,
      longitude,
      current: "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m",
      wind_speed_unit: "kmh",
    },
  });

  const current = res.data.current;

  return {
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: kmhToKnots(current.wind_speed_10m),
    windDirection: degreesToCompass(current.wind_direction_10m),
    temperature: Math.round(current.temperature_2m),
  };
}
