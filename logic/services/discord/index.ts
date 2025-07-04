import axios from 'axios';

import { envVars } from "../../utils";
import type { DiscordWebhookPayload } from "./types";


const sendMessage = async (payload: DiscordWebhookPayload): Promise<void> => {
    try {
        const response = await axios.post(envVars.DISCORD_WEBHOOK_URL(), payload);

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

export {
    sendMessage,
};
