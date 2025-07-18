import {
    filterByStatus,
    getAllPagesFromDatabase,
    getAssignUsers,
    getDueDate,
    getTaskName,
    sortByDueDate,
    sortByPriority,
    splitByCategory
} from "../../services/notion";
import { TEMPLATES } from "../../services/discord/constants";
import { sendMessage } from "../../services/discord";

export const notify = async (): Promise<void> => {
    const pages = await getAllPagesFromDatabase();
    const filterPages = splitByCategory(filterByStatus(pages, ["待機", "完了"]));
    const sortedFrontPages = sortByPriority(sortByDueDate(filterPages.front).slice(0, 3));
    const sortedBackPages = sortByPriority(sortByDueDate(filterPages.back).slice(0, 3));

    [
        { category: "front", pages: sortedFrontPages },
        { category: "back", pages: sortedBackPages },
    ].forEach(async ({category, pages}) => {
        if (pages.length === 0) {
            return;
        }

        const assignUsers = pages.map(page => getAssignUsers(page));
        const message = pages.map((page, idx) => {
            const taskName = getTaskName(page);
            const url = `https://www.notion.so/${page.id.replace(/-/g, "")}`;
            const users = assignUsers[idx];
            const due = getDueDate(page);
            return TEMPLATES.task(taskName, url, users, due);
        }).join("\n\n");

        await sendMessage({
            "content": `#  :memo: ${category}'s タスク\n\n${message}`,
            "allowed_mentions": { "parse": ["users", "roles"], "replied_user": true },
        });
    })
}
