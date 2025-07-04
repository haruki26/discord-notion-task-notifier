import { envVars, parseJson } from "../../utils"
import { UserIds } from "./types"

const USER_IDS = parseJson<UserIds>(envVars.DISCORD_USERID_JSON())

const _changeUserId = (userName: string): string => {
    const userId = USER_IDS[userName];
    if (!userId) {
        return `@${userName}`;
    }
    return `@${userId}`;
}

const _createTaskMessage = (
    taskName: string,
    url: string,
    assignUsers: string[],
    due: string,
): string => (
`### [${taskName}](${url})
assign: ${assignUsers.map(_changeUserId).join(" ")}
due: ${due}`
)

const TEMPLATES = {
    task: _createTaskMessage,
}
