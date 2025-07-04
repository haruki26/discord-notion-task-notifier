import { Client } from "@notionhq/client";
import type {
    PartialPageObjectResponse,
    QueryDatabaseParameters,
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
        const response = await client.databases.query({
            database_id: databaseId,
            page_size: 100,
            start_cursor: cursor,
            ...queryProperties,
        });

        pages.push(...response.results.filter(
            (page): page is PartialPageObjectResponse => "object" in page
        ));
        cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
    } while (cursor);

    return pages;
}

const _hasProperty = <PT>(
    page: PartialPageObjectResponse,
    propertyName: string,
    typeGuard: (prop: unknown) => prop is PT
): page is PartialPageObjectResponse & { properties: Record<string, PT> } => {
    if (
        "properties" in page &&
        typeof page.properties === "object" &&
        page.properties !== null &&
        propertyName in page.properties
    ) {
        const prop = (page.properties as Record<string, unknown>)[propertyName];
        if (typeGuard) {
            return typeGuard(prop);
        }
        return true;
    }
    return false;
}

const sortByDueDate = (pages: PartialPageObjectResponse[]) => {
    const pName = PROPERTY_NAMES.dueDate;
    return pages
        .map(page => {
            if (_hasProperty<DatePropertyValue>(page, pName, isDatePropertyValue)) {
                const prop = page.properties[pName];
                if (prop.date && prop.date.start) {
                    return page;
                }
            }
            return null
        })
        .filter(page => page !== null)
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
    return pages
        .map(page => {
            if (_hasProperty<SelectPropertyValue>(page, pName, isSelectPropertyValue)) {
                const prop = page.properties[pName];
                if (prop.select && prop.select.name) {
                    return page;
                }
            }
            return null;
        })
        .filter(page => page !== null)
        .sort((a, b) => {
            const aPriority = a.properties[pName];
            const bPriority = b.properties[pName];
            if (aPriority.select && bPriority.select) {
                return aPriority.select.name.localeCompare(bPriority.select.name);
            }
            return 0;
        })
}

const getAssignUsers = (page: PartialPageObjectResponse): string[] => {
    const pName = PROPERTY_NAMES.assignUsers;
    if (_hasProperty<MultiSelectPropertyValue>(page, pName, isMultiSelectPropertyValue)) {
        const prop = page.properties[pName];
        return prop.multi_select.map(ms => ms.name)
    }
    return [];
}

export {
    getAllPagesFromDatabase,
    sortByDueDate,
    sortByPriority,
    getAssignUsers,
};
