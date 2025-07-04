import {
    DatePropertyValue,
    MultiSelectPropertyValue,
    SelectPropertyValue,
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

export {
    isDatePropertyValue,
    isSelectPropertyValue,
    isMultiSelectPropertyValue,
};
