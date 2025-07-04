import { Hono } from 'hono';
import notionApp from './notion';

const app = new Hono().basePath('/demo')

app.route('/notion', notionApp);

export default app;
