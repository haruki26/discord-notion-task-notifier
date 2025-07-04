import { Hono } from 'hono';
import {
    getAllPagesFromDatabase,
    sortByDueDate,
    sortByPriority,
    getAssignUsers,
} from "./../../../logic/services/notion";
import type { Context } from 'hono';

const app = new Hono();

// GET /demo/notion/all
app.get('/all', async (c: Context) => {
    const pages = await getAllPagesFromDatabase();
    return c.json(pages);
});

// GET /demo/notion/due
app.get('/due', async (c: Context) => {
    const pages = await getAllPagesFromDatabase();
    return c.json(sortByDueDate(pages));
});

// GET /demo/notion/priority
app.get('/priority', async (c: Context) => {
    const pages = await getAllPagesFromDatabase();
    return c.json(sortByPriority(pages));
});

// GET /demo/notion/assign-users
app.get('/assign-users', async (c: Context) => {
    const pages = await getAllPagesFromDatabase();
    const users = pages.map(getAssignUsers);
    return c.json(users);
});

export default app;
