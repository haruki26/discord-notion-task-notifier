const _getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export const envVars = {
    APP_ENVIRONMENT: _getEnv('APP_ENVIRONMENT'),
    API_KEY: _getEnv('API_KEY'),
    NOTION_API_TOKEN: _getEnv('NOTION_API_TOKEN'),
    NOTION_DATABASE_ID: _getEnv('NOTION_DATABASE_ID'),
    DISCORD_WEBHOOK_URL: _getEnv('DISCORD_WEBHOOK_URL'),
    DISCORD_USERID_JSON: _getEnv('DISCORD_USERID_JSON'),
} as const;

export const parseJson = <T = never>(jsonString: string): T => {
    // zodはめんどいからいれない
    // 気が向いたら入れる
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        throw new Error(`Failed to parse JSON. Error: ${error}`);
    }
}
