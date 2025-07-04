import { type Context, Hono } from "hono";
import { notify } from "../../../logic/routes/notify";


const app = new Hono();

app.post("/", async (c: Context) => {
    try {
        await notify();
        return c.json({ message: "Notification sent successfully" }, 200);
    } catch (error) {
        console.error("Error sending notification:", error);
        return c.json({ error: "Failed to send notification" }, 500);
    }
});

export default app;
