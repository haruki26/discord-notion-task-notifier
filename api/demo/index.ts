import { Hono } from 'hono';
import notionApp from './notion';
import discordApp from './discord';
import notifyApp from './notify';

const app = new Hono().basePath('/demo')

app.route('/notion', notionApp);
app.route('/discord', discordApp);
app.route('/notify', notifyApp);

export default app;
