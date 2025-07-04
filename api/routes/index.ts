import { Hono } from 'hono';
import notifyApp from './notify';

const app = new Hono().basePath('/api')

app.route('/notify', notifyApp);

export default app;
