import { describe, expect, it } from "vitest";
import { getFarmingHints, type WeatherData } from "./weather";

function makeWeather(overrides: Partial<WeatherData> = {}): WeatherData {
  return {
    latitude: 16.5,
    longitude: 80.6,
    timezone: "Asia/Kolkata",
    current: {
      time: "2026-06-01T08:00",
      temperature: 30,
      humidity: 60,
      windSpeed: 10,
      weatherCode: 1,
    },
    daily: [
      { date: "2026-06-01", weatherCode: 1, tempMax: 32, tempMin: 24, precipitationProbability: 10 },
      { date: "2026-06-02", weatherCode: 1, tempMax: 32, tempMin: 24, precipitationProbability: 10 },
      { date: "2026-06-03", weatherCode: 1, tempMax: 32, tempMin: 24, precipitationProbability: 10 },
    ],
    ...overrides,
  };
}

describe("getFarmingHints", () => {
  it("returns no hints for mild, calm, dry weather", () => {
    expect(getFarmingHints(makeWeather())).toEqual([]);
  });

  it("flags heavy rain expected tomorrow", () => {
    const weather = makeWeather();
    weather.daily[1].precipitationProbability = 80;

    const hints = getFarmingHints(weather);
    expect(hints).toContainEqual({ key: "heavyRainSoon", values: { days: 1 } });
  });

  it("flags heavy rain expected the day after tomorrow, and stops at the first match", () => {
    const weather = makeWeather();
    weather.daily[1].precipitationProbability = 80;
    weather.daily[2].precipitationProbability = 90;

    const hints = getFarmingHints(weather);
    const rainHints = hints.filter((h) => h.key === "heavyRainSoon");
    expect(rainHints).toEqual([{ key: "heavyRainSoon", values: { days: 1 } }]);
  });

  it("does not flag rain on the current day (index 0)", () => {
    const weather = makeWeather();
    weather.daily[0].precipitationProbability = 95;

    const hints = getFarmingHints(weather);
    expect(hints.some((h) => h.key === "heavyRainSoon")).toBe(false);
  });

  it("flags strong wind at or above 25", () => {
    const weather = makeWeather();
    weather.current.windSpeed = 25;

    expect(getFarmingHints(weather)).toContainEqual({ key: "strongWind" });
  });

  it("does not flag wind just under the threshold", () => {
    const weather = makeWeather();
    weather.current.windSpeed = 24.9;

    expect(getFarmingHints(weather).some((h) => h.key === "strongWind")).toBe(false);
  });

  it("flags heat stress at or above 38 today", () => {
    const weather = makeWeather();
    weather.daily[0].tempMax = 38;

    expect(getFarmingHints(weather)).toContainEqual({ key: "heatStress" });
  });

  it("can return multiple hints at once", () => {
    const weather = makeWeather();
    weather.current.windSpeed = 30;
    weather.daily[0].tempMax = 40;
    weather.daily[1].precipitationProbability = 75;

    const hints = getFarmingHints(weather);
    expect(hints).toHaveLength(3);
    expect(hints.map((h) => h.key).sort()).toEqual(
      ["heatStress", "heavyRainSoon", "strongWind"].sort(),
    );
  });
});
