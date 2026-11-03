import { app } from './app.js';
import { config } from './config.js';

app.listen(config.port, () => {
  console.log(`CTA Bus Tracker API listening on port ${config.port}`);
});
