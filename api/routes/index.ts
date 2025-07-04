import { Hono } from 'hono';

import { requireApiKey } from './middleware/auth';
import notifyApp from './notify';

const app = new Hono().basePath('/api');
app.use(requireApiKey)

app.route('/notify', notifyApp);

export default app;
