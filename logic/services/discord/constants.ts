import { convertUserId } from "."

const _createTaskMessage = (
    taskName: string,
    url: string,
    assignUsers: string[],
    due: string,
): string => (
    [
        `:memo: [${taskName}](${url})`,
        `:busts_in_silhouette: assign: ${assignUsers.map(convertUserId).join(" ")}`,
        `:alarm_clock: due: ${due}`,
    ].join("\n\n")
)

export const TEMPLATES = {
    task: _createTaskMessage,
}
