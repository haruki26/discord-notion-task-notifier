import axios from 'axios';

import { envVars, parseJson } from "../../utils";
import type { DiscordWebhookPayload, Ids } from "./types";


const sendMessage = async (payload: DiscordWebhookPayload): Promise<void> => {
    try {
        const response = await axios.post(envVars.DISCORD_WEBHOOK_URL, payload);

        if (response.status === 204) {
            console.log('メッセージが正常に送信されました！');
        } else {
            console.error(`メッセージ送信に失敗しました。ステータスコード: ${response.status}`);
            console.error('レスポンスデータ:', response.data);
        }
    } catch (error) {
        console.error('予期せぬエラーが発生しました:', error);
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
    return `<@${roleId}>`;
}

export {
    sendMessage,
    convertUserId,
    convertRoleId,
};
