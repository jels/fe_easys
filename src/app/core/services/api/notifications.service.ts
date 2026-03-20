// src/app/core/services/api/notifications.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { NotificationTypeResponse, AppNotificationResponse, NotificationStatsResponse, CreateNotificationTypeRequest, CreateAppNotificationRequest } from '../../models/notifications.models';
import { PageResponse } from '../../models/student.dto';

export interface NotificationFilter {
    idNotificationType?: number | null;
    isRead?: boolean | null;
    priority?: string | null;
    scope?: string | null;
    page?: number;
    size?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
    private readonly API = `${environment.apiUrl}notifications`;

    constructor(private http: HttpClient) {}

    // GET /api/v1/notifications/types?idCompany=
    getTypes(idCompany: number): Observable<ApiResponse<NotificationTypeResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<NotificationTypeResponse[]>>(`${this.API}/types`, { params });
    }

    // POST /api/v1/notifications/types
    createType(request: CreateNotificationTypeRequest): Observable<ApiResponse<NotificationTypeResponse>> {
        return this.http.post<ApiResponse<NotificationTypeResponse>>(`${this.API}/types`, request);
    }

    // GET /api/v1/notifications?idCompany=&idNotificationType=&isRead=&priority=&scope=&page=&size=
    getNotifications(idCompany: number, filters?: NotificationFilter): Observable<ApiResponse<PageResponse<AppNotificationResponse>>> {
        let params = new HttpParams()
            .set('idCompany', idCompany)
            .set('page', filters?.page ?? 0)
            .set('size', filters?.size ?? 20);
        if (filters?.idNotificationType != null) params = params.set('idNotificationType', filters.idNotificationType);
        if (filters?.isRead != null) params = params.set('isRead', filters.isRead);
        if (filters?.priority) params = params.set('priority', filters.priority);
        if (filters?.scope) params = params.set('scope', filters.scope);
        return this.http.get<ApiResponse<PageResponse<AppNotificationResponse>>>(this.API, { params });
    }

    // POST /api/v1/notifications
    createAndSend(request: CreateAppNotificationRequest): Observable<ApiResponse<AppNotificationResponse>> {
        return this.http.post<ApiResponse<AppNotificationResponse>>(this.API, request);
    }

    // PATCH /api/v1/notifications/{id}/read
    markAsRead(idNotification: number): Observable<ApiResponse<AppNotificationResponse>> {
        return this.http.patch<ApiResponse<AppNotificationResponse>>(`${this.API}/${idNotification}/read`, null);
    }

    // PATCH /api/v1/notifications/{id}/unread
    markAsUnread(idNotification: number): Observable<ApiResponse<AppNotificationResponse>> {
        return this.http.patch<ApiResponse<AppNotificationResponse>>(`${this.API}/${idNotification}/unread`, null);
    }

    // PATCH /api/v1/notifications/mark-all-read?idCompany=&idNotificationType=
    markAllAsRead(idCompany: number, idNotificationType?: number): Observable<ApiResponse<void>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (idNotificationType != null) params = params.set('idNotificationType', idNotificationType);
        return this.http.patch<ApiResponse<void>>(`${this.API}/mark-all-read`, null, { params });
    }

    // DELETE /api/v1/notifications/{id}
    deleteNotification(idNotification: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/${idNotification}`);
    }

    // GET /api/v1/notifications/stats?idCompany=
    getStats(idCompany: number): Observable<ApiResponse<NotificationStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<NotificationStatsResponse>>(`${this.API}/stats`, { params });
    }
}
