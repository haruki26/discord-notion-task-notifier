import { envVars, parseJson } from "../../utils"
import { DiscordWebhookPayload, UserIds } from "./types"

const USER_IDS = parseJson<UserIds>(envVars.DISCORD_USERID_JSON())

const _convertUserId = (userName: string): string => {
    const userId = USER_IDS[userName];
    if (!userId) {
        return `@${userName}`;
    }
    return `<@${userId}>`;
}

const _createTaskMessage = (
    taskName: string,
    url: string,
    assignUsers: string[],
    due: string,
): DiscordWebhookPayload => ({
    "content": `## [${taskName}](${url})`
                + `assign: ${assignUsers.map(_convertUserId).join(" ")}`
                + `due: ${due}`,
    "allowed_mentions": { "parse": ["users"], "replied_user": true }
})

export const TEMPLATES = {
    task: _createTaskMessage,
}
