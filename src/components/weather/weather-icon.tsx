import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";

// A single stable component that picks the right icon for a WMO weather
// code — keeps the icon selection out of render-time component creation.
export function WeatherIcon({ code, className }: { code: number; className?: string }) {
  if (code === 0 || code === 1) return <Sun className={className} aria-hidden="true" />;
  if (code === 2) return <CloudSun className={className} aria-hidden="true" />;
  if (code === 3) return <Cloud className={className} aria-hidden="true" />;
  if (code === 45 || code === 48) return <CloudFog className={className} aria-hidden="true" />;
  if ([51, 53, 55, 56, 57].includes(code)) {
    return <CloudDrizzle className={className} aria-hidden="true" />;
  }
  if ([61, 63, 65, 80, 81, 82].includes(code)) {
    return <CloudRain className={className} aria-hidden="true" />;
  }
  if ([66, 67, 71, 73, 75, 77, 85, 86].includes(code)) {
    return <CloudSnow className={className} aria-hidden="true" />;
  }
  if ([95, 96, 99].includes(code)) {
    return <CloudLightning className={className} aria-hidden="true" />;
  }
  return <Cloud className={className} aria-hidden="true" />;
}
