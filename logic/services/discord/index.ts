import axios from 'axios';

import { envVars, parseJson } from "../../utils";
import type { DiscordWebhookPayload, Ids } from "./types";


const sendMessage = async (payload: DiscordWebhookPayload): Promise<void> => {
    try {
        await axios.post(envVars.DISCORD_WEBHOOK_URL, payload);
    } catch (error) {
        return
    }
}

const convertUserId = (userName: string): string => {
    const userId = parseJson<Ids>(envVars.DISCORD_USERID_JSON)[userName];
    if (!userId) {
        return `@${userName}`;
    }
    return `<@${userId}>`;
}

const convertRoleId = (roleName: string): string => {
    const roleId = parseJson<Ids>(envVars.DiSCORD_ROLEID_JSON)[roleName];
    if (!roleId) {
        return `@${roleName}`;
    }
    return `<@&${roleId}>`;
}

export {
    sendMessage,
    convertUserId,
    convertRoleId,
};
