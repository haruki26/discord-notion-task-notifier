const _getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export const envVars = {
    APP_ENVIRONMENT: () => _getEnv('APP_ENVIRONMENT'),
    NOTION_API_TOKEN: () => _getEnv('NOTION_API_TOKEN'),
    NOTION_DATABASE_ID: () => _getEnv('NOTION_DATABASE_ID'),
} as const;
