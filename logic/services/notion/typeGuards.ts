import type {
    DatePropertyValue,
    MultiSelectPropertyValue,
    SelectPropertyValue,
    StatusPropertyValue,
    TitlePropertyValue,
} from "./types";


// 共通の型ガードロジック
const _isTypedPropertyValue = <T extends string, V = unknown>(
    prop: unknown,
    type: T,
    valueKey: string,
    valueCheck: (v: any) => boolean
): prop is { type: T } & Record<typeof valueKey, V> => {
    return (
        typeof prop === 'object' &&
        prop !== null &&
        (prop as any).type === type &&
        valueKey in prop &&
        (typeof (prop as any)[valueKey] === 'object' || (prop as any)[valueKey] === null) &&
        (
            (prop as any)[valueKey] === null ||
            valueCheck((prop as any)[valueKey])
        )
    );
};

const isDatePropertyValue = (prop: unknown): prop is DatePropertyValue =>
    _isTypedPropertyValue(
        prop,
        'date',
        'date',
        (date) => typeof date.start === 'string'
    );

const isSelectPropertyValue = (prop: unknown): prop is SelectPropertyValue =>
    _isTypedPropertyValue(
        prop,
        'select',
        'select',
        (select) => typeof select.name === 'string'
    );

const isMultiSelectPropertyValue = (prop: unknown): prop is MultiSelectPropertyValue => 
    _isTypedPropertyValue(
        prop,
        'multi_select',
        'multi_select',
        (multiSelect) => Array.isArray(multiSelect) && multiSelect.every(ms => typeof ms.name === 'string')
    );

const isTitlePropertyValue = (prop: unknown): prop is TitlePropertyValue =>
    _isTypedPropertyValue(
        prop,
        'title',
        'title',
        (title) => Array.isArray(title) && title.every(t => typeof t.plain_text === 'string')
    );

const isStatusPropertyValue = (prop: unknown): prop is StatusPropertyValue =>
    _isTypedPropertyValue(
        prop,
        'status',
        'status',
        (status) => typeof status.name === 'string'
    );

export {
    isDatePropertyValue,
    isSelectPropertyValue,
    isMultiSelectPropertyValue,
    isTitlePropertyValue,
    isStatusPropertyValue,
};
