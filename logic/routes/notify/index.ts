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
import { convertRoleId, sendMessage } from "../../services/discord";

export const notify = async (): Promise<void> => {
    const pages = await getAllPagesFromDatabase();
    const filterPages = splitByCategory(filterByStatus(pages, ["待機", "完了"]));
    const sortedFrontPages = sortByPriority(sortByDueDate(filterPages.front).slice(0, 3));
    const sortedBackPages = sortByPriority(sortByDueDate(filterPages.back).slice(0, 3));

    const splitPages = [
        { category: "front", pages: sortedFrontPages },
        { category: "back", pages: sortedBackPages },
    ];

    for(const {category, pages} of splitPages) {
        if (pages.length === 0) {
            return;
        }

        const assignUsers = pages.map(page => getAssignUsers(page));
        const role = convertRoleId(category);
        const messages = pages.map((page, idx) => {
            const taskName = getTaskName(page);
            const url = `https://www.notion.so/${page.id.replace(/-/g, "")}`;
            const users = assignUsers[idx];
            const due = getDueDate(page);
            return TEMPLATES.task(taskName, url, users, due);
        });

        await sendMessage({
            "content": [
                "# 仕事ノコッテルヨ？ :fire:",
                `Hey, ${role} team.`,
                "If you don't finish soon, you're gonna get into trouble!",
            ].join("\n"),
            "allowed_mentions": {
                "parse": ["users"],
                "replied_user": true,
                "roles": [role.replace(/<@&/g, "").replace(/>/g, "")]
            },
        });

        for (const message of messages) {
            await sendMessage({
                "content": message,
                "allowed_mentions": { "parse": ["users"], "replied_user": true },
            });
        }
    }
}
