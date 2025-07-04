import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { envVars } from '../logic/utils'

import demoApp from './demo'

export const config = {
  runtime: 'edge'
}

const app = envVars.APP_ENVIRONMENT() === "production"
    ? new Hono().basePath('/api')
    : demoApp;

export default handle(app);
