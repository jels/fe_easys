// src/app/core/models/notifications.models.ts

export interface NotificationTypeResponse {
    idNotificationType: number;
    idCompany: number;
    name: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    isActive: boolean;
}

export interface AppNotificationResponse {
    idAppNotification: number;
    idCompany: number;
    idNotificationType: number;
    typeName?: string | null;
    typeColor?: string | null;
    typeIcon?: string | null;
    title: string;
    body: string;
    priority: string; // LOW | MEDIUM | HIGH | CRITICAL
    scope: string; // ALL | GRADE | SECTION | STUDENT | STAFF
    idTarget?: number | null;
    isRead: boolean;
    isSent: boolean;
    sentAt?: string | null;
    idCreatedByStaff?: number | null;
    createdByName?: string | null;
    isActive: boolean;
    createdAt?: string;
}

export interface NotificationStatsResponse {
    total: number;
    unread: number;
    critical: number;
    unsent: number;
    byType: NotificationTypeStat[];
}

export interface NotificationTypeStat {
    idNotificationType: number;
    name: string;
    count: number;
    unread: number;
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreateNotificationTypeRequest {
    idCompany: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

export interface CreateAppNotificationRequest {
    idCompany: number;
    idNotificationType: number;
    title: string;
    body: string;
    priority?: string; // default MEDIUM
    scope?: string; // default ALL
    idTarget?: number;
    idCreatedByStaff?: number;
    sendNow?: boolean; // default true
}
