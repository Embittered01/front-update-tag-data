import type { CoordinateDto, RoutePoint } from '@/types';

const OSRM_BASE_URL =
  process.env.NEXT_PUBLIC_OSRM_BASE_URL || 'https://router.project-osrm.org';

export interface OsrmRouteResult {
  route: RoutePoint[];
  distance: number;
  duration: number;
}

export class OsrmService {
  async getRoute(start: CoordinateDto, end: CoordinateDto): Promise<OsrmRouteResult> {
    const coords = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM error ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error('OSRM did not return a valid route');
    }

    const osrmRoute = data.routes[0];
    const route: RoutePoint[] = osrmRoute.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ lat, lng })
    );

    return {
      route,
      distance: osrmRoute.distance,
      duration: osrmRoute.duration,
    };
  }
}

export const osrmService = new OsrmService();
