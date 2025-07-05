import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { envVars } from '../logic/utils';

import productionApp from './routes';
import demoApp from './demo';

export const config = {
  runtime: 'edge'
}

const app = envVars.APP_ENVIRONMENT === "production"
    ? productionApp
    : demoApp;

export default handle(app);
