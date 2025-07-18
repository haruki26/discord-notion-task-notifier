type DiscordEmbed = {
    title?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: {
        text: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    image?: {
        url?: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    thumbnail?: {
        url?: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    video?: {
        url?: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    };
    provider?: {
        name?: string;
        url?: string;
    };
    author?: {
        name?: string;
        url?: string;
        icon_url?: string;
        proxy_icon_url?: string;
    };
    fields?: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
}

type AllowedMentions = {
    parse?: ('roles' | 'users' | 'everyone')[];
    users?: string[];
    roles?: string[];
    replied_user: boolean;
}

type DiscordWebhookPayload = {
    content?: string;
    username?: string;
    avatar_url?: string;
    tts?: boolean;
    embeds?: DiscordEmbed[];
    allowed_mentions?: AllowedMentions;
    components?: unknown[];
    attachments?: unknown[];
}

type Ids = Record<string, string>;

export type {
    DiscordWebhookPayload,
    Ids,
}
