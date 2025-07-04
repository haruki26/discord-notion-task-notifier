import type { PageObjectResponse } from "@notionhq/client";

// Notionのページオブジェクトのプロパティ型を定義
// ここでは、PageObjectResponseのpropertiesフィールドから特定のプロパティ型を抽出
// なんでこんなことしなあかんねん
type PageProperty = NonNullable<PageObjectResponse["properties"][string]>;

type DatePropertyValue = Extract<PageProperty, { type: "date" }>;
type SelectPropertyValue = Extract<PageProperty, { type: "select" }>;
type MultiSelectPropertyValue = Extract<PageProperty, { type: "multi_select" }>;
type TitlePropertyValue = Extract<PageProperty, { type: "title" }>;

export type {
    DatePropertyValue,
    SelectPropertyValue,
    MultiSelectPropertyValue,
    TitlePropertyValue,
}
