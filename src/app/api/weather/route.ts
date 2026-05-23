import { ApiError, handleApiError, ok } from "@/lib/api/http";
import { getAuthenticatedUser } from "@/lib/api/guards";
import { getWeather, geocode, reverseGeocode, isAmapConfigured } from "@/lib/services/weather";

export async function GET(request: Request) {
  try {
    await getAuthenticatedUser(request);

    if (!isAmapConfigured()) {
      throw new ApiError(503, "AMAP_NOT_CONFIGURED", "地图服务未配置");
    }

    const url = new URL(request.url);
    const city = url.searchParams.get("city");
    const address = url.searchParams.get("address");
    const lng = url.searchParams.get("lng");
    const lat = url.searchParams.get("lat");

    if (city) {
      const weather = await getWeather(city);
      if (!weather) {
        throw new ApiError(404, "WEATHER_NOT_FOUND", "未找到该城市的天气信息");
      }
      return ok(weather);
    }

    if (address) {
      const result = await geocode(address);
      if (!result) {
        throw new ApiError(404, "GEOCODE_NOT_FOUND", "未找到该地址");
      }
      return ok(result);
    }

    if (lng && lat) {
      const result = await reverseGeocode(lng, lat);
      if (!result) {
        throw new ApiError(404, "REVERSE_GEOCODE_FAILED", "逆地理编码失败");
      }
      return ok(result);
    }

    throw new ApiError(400, "MISSING_PARAMS", "请提供 city、address 或 lng+lat 参数");
  } catch (error) {
    return handleApiError(error);
  }
}
