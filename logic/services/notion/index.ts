import { Client } from "@notionhq/client";
import type {
    PartialPageObjectResponse,
    QueryDatabaseParameters,
    QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

import { envVars } from "../../utils";
import {
    isDatePropertyValue,
    isMultiSelectPropertyValue,
    isSelectPropertyValue,
    isStatusPropertyValue,
    isTitlePropertyValue
} from "./typeGuards";
import type {
    DatabaseStatus,
    DatePropertyValue,
    MultiSelectPropertyValue,
    SelectPropertyValue,
    StatusPropertyValue,
    TitlePropertyValue
} from "./types";
import { PRIORITY_ORDER, PROPERTY_NAMES } from "./constants";

const client = new Client({
    auth: envVars.NOTION_API_TOKEN,
});

const getAllPagesFromDatabase = async (
    databaseId: string = envVars.NOTION_DATABASE_ID,
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

type Property<PT = unknown> = { properties: Record<string, PT> };

type PartialPageObjectResponseWithProperties<PT = unknown> = 
    PartialPageObjectResponse & Property<PT>;

const _hasProperty = <T extends PartialPageObjectResponse>(
    page: T
): page is T & Property => {
    return "properties" in page &&
        typeof page.properties === "object" &&
        page.properties !== null;
}

const _sort = <T extends PartialPageObjectResponse, PT>(
    pages: T[],
    hasPropertyGuard: (prop: unknown) => prop is PT,
    propertyName: string,
    sortFn: (a: T & Property<PT>, b: T & Property<PT>) => number,
    additionalFilter?: (page: T & Property<PT>) => boolean
): (T & Property<PT>)[] => {
    const hasDetailProperty = <PW extends PartialPageObjectResponseWithProperties>(
        page: PW,
    ): page is PW & Property<PT> => {
        return hasPropertyGuard(page.properties[propertyName]);
    }

    const filterPage = pages
        .filter(_hasProperty)
        .filter(hasDetailProperty)
    
    if (additionalFilter) {
        return filterPage
            .filter(additionalFilter)
            .sort(sortFn);
    }
    return filterPage.sort(sortFn);
}

const sortByDueDate = <T extends PartialPageObjectResponse>(pages: T[]): (T & Property<DatePropertyValue>)[] => {
    const pName = PROPERTY_NAMES.dueDate;
    const sortFn = (
        a: T & Property<DatePropertyValue>,
        b: T & Property<DatePropertyValue>
    ): number => {
        const aDate = a.properties[pName];
        const bDate = b.properties[pName];
        if (aDate.date && bDate.date) {
            return new Date(aDate.date.start).getTime() - new Date(bDate.date.start).getTime();
        }
        return 0;
    }

    return _sort(pages, isDatePropertyValue, pName, sortFn)
}

const sortByPriority = <T extends PartialPageObjectResponse>(pages: T[]): (T & Property<SelectPropertyValue>)[] => {
    const pName = PROPERTY_NAMES.priority;

    const priorityIndex = (priority: string): number => {
        const idx = PRIORITY_ORDER.findIndex(name => priority === name);
        return idx !== -1 ? idx : PRIORITY_ORDER.length;
    };

    const sortFn = (
        a: T & Property<SelectPropertyValue>,
        b: T & Property<SelectPropertyValue>
    ): number => {
        const aPriority = a.properties[pName].select;
        const bPriority = b.properties[pName].select;
        if (aPriority && bPriority) {
            return priorityIndex(aPriority.name) - priorityIndex(bPriority.name);
        }
        return 0;
    }

    const additionalFilter = (
        page: PartialPageObjectResponseWithProperties<SelectPropertyValue>
    ): boolean =>  !!page.properties[pName].select && !!page.properties[pName].select.name;

    return _sort(
        pages,
        isSelectPropertyValue,
        pName,
        sortFn,
        additionalFilter
    );
};

const getAssignUsers = (page: PartialPageObjectResponse): string[] => {
    if (!_hasProperty(page)) return [];
    const pName = PROPERTY_NAMES.assignUsers;

    const hasAssignUsersProperty = (
        p: PartialPageObjectResponseWithProperties
    ): p is PartialPageObjectResponseWithProperties<MultiSelectPropertyValue> => {
        return isMultiSelectPropertyValue(p.properties[pName]);
    };
    if (!hasAssignUsersProperty(page)) return [];

    const prop = page.properties[pName];
    return Array.isArray(prop.multi_select) ? prop.multi_select.map(ms => ms.name) : [];
}

const getTaskName = (page: PartialPageObjectResponse): string => {
    if (!_hasProperty(page)) return "";
    const pName = PROPERTY_NAMES.title;

    const hasTitleProperty = (
        p: PartialPageObjectResponseWithProperties
    ): p is PartialPageObjectResponseWithProperties<TitlePropertyValue> => {
        return isTitlePropertyValue(p.properties[pName]);
    };
    if (!hasTitleProperty(page)) return "";

    const prop = page.properties[pName];
    return Array.isArray(prop.title) && prop.title[0]?.plain_text
        ? prop.title[0].plain_text
        : "";
}

const getDueDate = (page: PartialPageObjectResponse): string => {
    if (!_hasProperty(page)) return "";
    const pName = PROPERTY_NAMES.dueDate;

    const hasDateProperty = (
        p: PartialPageObjectResponseWithProperties
    ): p is PartialPageObjectResponseWithProperties<DatePropertyValue> => {
        return isDatePropertyValue(p.properties[pName]);
    };
    if (!hasDateProperty(page)) return "";

    const prop = page.properties[pName];
    return prop.date ? prop.date.start : "";
}

const filterByStatus = <T extends PartialPageObjectResponse>(
    pages: T[],
    filterBy: DatabaseStatus[],
): (T & Property<StatusPropertyValue>)[] => {
    const pName = PROPERTY_NAMES.status;

    const hasStatusProperty = (p: T & Property): p is T & Property<StatusPropertyValue> => {
        return isStatusPropertyValue(p.properties[pName]);
    };

    return pages
        .filter(_hasProperty)
        .filter(hasStatusProperty)
        .filter(page =>
            filterBy.findIndex(
                status => status === page.properties[pName].status?.name
            ) === -1
        );
}


export {
    getAllPagesFromDatabase,
    sortByDueDate,
    sortByPriority,
    getAssignUsers,
    getTaskName,
    getDueDate,
    filterByStatus,
};
