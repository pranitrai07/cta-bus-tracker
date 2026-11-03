const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export type BusRoute = { rt: string; rtnm: string; rtclr?: string; rtdd?: string };
export type Direction = { id: string; name: string };
export type BusStop = { stpid: string; stpnm: string; lat?: string; lon?: string; ada?: string };
export type Prediction = {
  tmstmp?: string;
  typ?: string;
  stpid?: string;
  stpnm?: string;
  vid?: string;
  rt?: string;
  rtdd?: string;
  rtdir?: string;
  des?: string;
  prdtm?: string;
  prdctdn?: string;
  dyn?: string;
};

async function getJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    throw new Error(`Can’t connect to the backend at ${API_BASE_URL}. Check the URL in mobile/.env and make sure the backend is running.`);
  }
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);
  return body;
}

export async function getRoutes(): Promise<BusRoute[]> {
  const data = await getJson<{ routes: BusRoute[] }>('/routes');
  return data.routes;
}

export async function getDirections(routeId: string): Promise<Direction[]> {
  const data = await getJson<{ directions: Direction[] }>(`/routes/${encodeURIComponent(routeId)}/directions`);
  return data.directions;
}

export async function getStops(routeId: string, direction: string): Promise<BusStop[]> {
  const query = new URLSearchParams({ routeId, direction });
  const data = await getJson<{ stops: BusStop[] }>(`/stops?${query.toString()}`);
  return data.stops;
}

export async function getPredictions(stopId: string, routeId?: string): Promise<Prediction[]> {
  const query = routeId ? `?routeId=${encodeURIComponent(routeId)}` : '';
  const data = await getJson<{ predictions: Prediction[] }>(`/stops/${encodeURIComponent(stopId)}/predictions${query}`);
  return data.predictions;
}
