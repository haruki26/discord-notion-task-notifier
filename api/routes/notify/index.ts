import { Hono } from "hono";
import { notify } from "../../../logic/routes/notify";


const app = new Hono();

app.post("/", notify);

export default app;
