import { envVars } from "./../../../logic/utils";
import type { MiddlewareHandler } from "hono";

export const requireApiKey: MiddlewareHandler = async (c, next) => {
    const apiKey = c.req.header("x-api-key");
    if (apiKey !== envVars.API_KEY()) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    return next();
};
