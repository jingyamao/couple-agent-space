const AMAP_KEY = process.env.AMAP_SERVICE_KEY ?? process.env.AMAP_JS_KEY ?? "";

type WeatherResult = {
  city: string;
  weather: string;
  temperature: string;
  humidity: string;
  winddirection: string;
  windpower: string;
  reporttime: string;
};

type GeocodeResult = {
  formattedAddress: string;
  province: string;
  city: string;
  district: string;
  location: string;
};

export function isAmapConfigured(): boolean {
  return !!AMAP_KEY;
}

export async function getWeather(city: string): Promise<WeatherResult | null> {
  if (!AMAP_KEY) return null;

  try {
    const res = await fetch(
      `https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${encodeURIComponent(city)}&extensions=base`
    );
    const data = await res.json();

    if (data.status === "1" && data.lives?.[0]) {
      const live = data.lives[0];
      return {
        city: live.city,
        weather: live.weather,
        temperature: live.temperature,
        humidity: live.humidity,
        winddirection: live.winddirection,
        windpower: live.windpower,
        reporttime: live.reporttime
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function geocode(address: string): Promise<GeocodeResult | null> {
  if (!AMAP_KEY) return null;

  try {
    const res = await fetch(
      `https://restapi.amap.com/v3/geocode/geo?key=${AMAP_KEY}&address=${encodeURIComponent(address)}`
    );
    const data = await res.json();

    if (data.status === "1" && data.geocodes?.[0]) {
      const geo = data.geocodes[0];
      return {
        formattedAddress: geo.formatted_address,
        province: geo.province,
        city: geo.city,
        district: geo.district,
        location: geo.location
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function reverseGeocode(lng: string, lat: string): Promise<GeocodeResult | null> {
  if (!AMAP_KEY) return null;

  try {
    const res = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_KEY}&location=${lng},${lat}`
    );
    const data = await res.json();

    if (data.status === "1" && data.regeocode) {
      const r = data.regeocode;
      return {
        formattedAddress: r.formatted_address,
        province: r.addressComponent?.province ?? "",
        city: r.addressComponent?.city ?? "",
        district: r.addressComponent?.district ?? "",
        location: `${lng},${lat}`
      };
    }
    return null;
  } catch {
    return null;
  }
}
