import { Hono } from 'hono';
import notionApp from './notion';
import discordApp from './discord'

const app = new Hono().basePath('/demo')

app.route('/notion', notionApp);
app.route('/discord', discordApp);

export default app;
