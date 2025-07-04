import { Context } from "hono";
import {
    getAllPagesFromDatabase,
    getAssignUsers,
    getDueDate,
    getTaskName,
    sortByDueDate,
    sortByPriority
} from "../../services/notion";
import { TEMPLATES } from "../../services/discord/constants";
import { sendMessage } from "../../services/discord";

export const notify = async (): Promise<void> => {
    const pages = await getAllPagesFromDatabase();
    const sortedPages = sortByPriority(sortByDueDate(pages).slice(0, 3));
    const assignUsers = sortedPages.map(page => getAssignUsers(page));

    const message = sortedPages.map((page, idx) => {
        const taskName =  getTaskName(page);
        const url = `https://www.notion.so/${page.id.replace(/-/g, "")}`;
        const users = assignUsers[idx];
        const due = getDueDate(page);
        return TEMPLATES.task(taskName, url, users, due);
    }).join("\n\n");

    await sendMessage({
        "content": `# 仕事があるお\n\n${message}`,
        "allowed_mentions": { "parse": ["users"], "replied_user": false },
    })
}
