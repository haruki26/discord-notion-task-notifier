import { Hono } from "hono";
import type { Context } from "hono";
import { TEMPLATES } from "../../../logic/services/discord/constants";
import { sendMessage } from "../../../logic/services/discord";


const app = new Hono()

app.get("message", async (c: Context) => {
    const mes = TEMPLATES.task(
        "Test",
        "https://google.com",
        ["hogehoge", "fugafuga", "piyopiyo"],
        "7/4"
    )
    await sendMessage({"content": mes});
    return c.json({"resp": "success"})
})

export default app;

