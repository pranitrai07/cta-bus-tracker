import { Router } from 'express';
import { asArray, ctaGet } from '../../cta/client.js';

type Route = { rt: string; rtnm: string; rtclr?: string; rtdd?: string };
type Direction = { id: string; name: string };
type Stop = { stpid: string; stpnm: string; lat?: string; lon?: string; ada?: string };
type Prediction = {
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

export const transitRouter = Router();

transitRouter.get('/routes', async (_req, res, next) => {
  try {
    const data = await ctaGet<{ routes?: Route | Route[] }>('getroutes');
    res.json({ routes: asArray(data.routes) });
  } catch (error) { next(error); }
});

transitRouter.get('/routes/:routeId/directions', async (req, res, next) => {
  try {
    const data = await ctaGet<{ directions?: Direction | Direction[] }>('getdirections', { rt: req.params.routeId });
    res.json({ directions: asArray(data.directions) });
  } catch (error) { next(error); }
});

transitRouter.get('/stops', async (req, res, next) => {
  const stopId = typeof req.query.stopId === 'string' ? req.query.stopId.trim() : '';
  const routeId = typeof req.query.routeId === 'string' ? req.query.routeId.trim() : '';
  const direction = typeof req.query.direction === 'string' ? req.query.direction.trim() : '';

  if (stopId && (routeId || direction)) {
    res.status(400).json({ error: 'Provide stopId or both routeId and direction, not both.' });
    return;
  }
  if (!stopId && (!routeId || !direction)) {
    res.status(400).json({ error: 'Provide stopId or both routeId and direction.' });
    return;
  }
  if (stopId && !/^\d+(,\d+){0,9}$/.test(stopId)) {
    res.status(400).json({ error: 'stopId must contain one to ten numeric CTA Stop IDs.' });
    return;
  }

  try {
    const params = stopId ? { stpid: stopId } : { rt: routeId, dir: direction };
    const data = await ctaGet<{ stops?: Stop | Stop[] }>('getstops', params);
    res.json({ stops: asArray(data.stops) });
  } catch (error) { next(error); }
});

transitRouter.get('/stops/:stopId/predictions', async (req, res, next) => {
  const stopId = req.params.stopId.trim();
  const routeId = typeof req.query.routeId === 'string' ? req.query.routeId.trim() : undefined;
  if (!/^\d+$/.test(stopId)) {
    res.status(400).json({ error: 'stopId must be a numeric CTA Stop ID.' });
    return;
  }

  try {
    const data = await ctaGet<{ prd?: Prediction | Prediction[] }>('getpredictions', {
      stpid: stopId,
      rt: routeId,
      tmres: 's',
      unixTime: 'true',
    });
    res.json({ stopId, predictions: asArray(data.prd) });
  } catch (error) { next(error); }
});
