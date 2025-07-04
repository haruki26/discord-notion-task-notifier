import { Hono } from "hono";
import { notify } from "../../../logic/routes/notify";


const app = new Hono();

app.get("/", notify);

export default app;
