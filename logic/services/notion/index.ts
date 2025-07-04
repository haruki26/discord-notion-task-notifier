import { Client } from "@notionhq/client";
import type {
    PartialPageObjectResponse,
    QueryDatabaseParameters,
    QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

import { envVars } from "../../utils";
import { isDatePropertyValue, isMultiSelectPropertyValue, isSelectPropertyValue } from "./typeGuards";
import { DatePropertyValue, MultiSelectPropertyValue, SelectPropertyValue } from "./types";
import { PROPERTY_NAMES } from "./constants";

const client = new Client({
    auth: envVars.NOTION_API_TOKEN(),
});

const getAllPagesFromDatabase = async (
    databaseId: string = envVars.NOTION_DATABASE_ID(),
    queryProperties: Omit<QueryDatabaseParameters, "database_id" | "page_size" | "start_cursor"> = {}
): Promise<PartialPageObjectResponse[]> => {
    const pages = [];
    let cursor: string | undefined = undefined;

    do {
        try {
            const response: QueryDatabaseResponse = await client.databases.query({
                database_id: databaseId,
                page_size: 100,
                start_cursor: cursor,
                ...queryProperties,
            });

            pages.push(...response.results.filter(
                (page): page is PartialPageObjectResponse => "object" in page
            ));
            cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
        } catch (error) {
            console.error("Error querying Notion database:", error);
            throw error;
        }
    } while (cursor);

    return pages;
}

type PartialPageObjectResponseWithProperties<PT = unknown> = PartialPageObjectResponse & {
    properties: Record<string, PT>;
}

const _hasProperty = (
    page: PartialPageObjectResponse
): page is PartialPageObjectResponseWithProperties => {
    return "properties" in page &&
        typeof page.properties === "object" &&
        page.properties !== null;
}

const sortByDueDate = (pages: PartialPageObjectResponse[]) => {
    const pName = PROPERTY_NAMES.dueDate;
    const hasDateProperty = (
        page: PartialPageObjectResponseWithProperties
    ): page is PartialPageObjectResponseWithProperties<DatePropertyValue> => {
        return isDatePropertyValue(page.properties[pName]);
    }

    return pages
        .filter(_hasProperty)
        .filter(hasDateProperty)
        .sort((a, b) => {
            const aDate = a.properties[pName];
            const bDate = b.properties[pName];
            if (aDate.date && bDate.date) {
                return new Date(bDate.date.start).getTime() - new Date(aDate.date.start).getTime();
            }
            return 0;
        })
}

const sortByPriority = (pages: PartialPageObjectResponse[]) => {
    const pName = PROPERTY_NAMES.priority;
    const hasPriorityProperty = (
        page: PartialPageObjectResponseWithProperties
    ): page is PartialPageObjectResponseWithProperties<SelectPropertyValue> => {
        return isSelectPropertyValue(page.properties[pName]) && !!page.properties[pName].select && !!page.properties[pName].select.name;
    };

    return pages
        .filter(_hasProperty)
        .filter(hasPriorityProperty)
        .sort((a, b) => {
            const aPriority = a.properties[pName];
            const bPriority = b.properties[pName];
            if (aPriority.select && bPriority.select) {
                return aPriority.select.name.localeCompare(bPriority.select.name);
            }
            return 0;
        });
}

const getAssignUsers = (page: PartialPageObjectResponse): string[] => {
    const pName = PROPERTY_NAMES.assignUsers;
    if (!_hasProperty(page)) return [];
    const hasAssignUsersProperty = (
        p: PartialPageObjectResponseWithProperties
    ): p is PartialPageObjectResponseWithProperties<MultiSelectPropertyValue> => {
        return isMultiSelectPropertyValue(p.properties[pName]);
    };
    if (!hasAssignUsersProperty(page)) return [];
    const prop = page.properties[pName];
    return Array.isArray(prop.multi_select) ? prop.multi_select.map(ms => ms.name) : [];
}

export {
    getAllPagesFromDatabase,
    sortByDueDate,
    sortByPriority,
    getAssignUsers,
};
