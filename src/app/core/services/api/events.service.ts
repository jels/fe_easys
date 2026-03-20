// src/app/core/services/api/events.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { EventTypeResponse, EventResponse, EventRegistrationResponse, EventStatsResponse, CreateEventTypeRequest, CreateEventRequest, UpdateEventRequest, RegisterStudentEventRequest } from '../../models/events.models';
import { PageResponse } from '../../models/student.dto';

export interface EventFilter {
    search?: string;
    status?: string;
    idEventType?: number;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    size?: number;
}

@Injectable({ providedIn: 'root' })
export class EventsService {
    private readonly API = `${environment.apiUrl}events`;

    constructor(private http: HttpClient) {}

    // GET /api/v1/events/types?idCompany=
    getEventTypes(idCompany: number): Observable<ApiResponse<EventTypeResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<EventTypeResponse[]>>(`${this.API}/types`, { params });
    }

    // POST /api/v1/events/types
    createEventType(request: CreateEventTypeRequest): Observable<ApiResponse<EventTypeResponse>> {
        return this.http.post<ApiResponse<EventTypeResponse>>(`${this.API}/types`, request);
    }

    // GET /api/v1/events?idCompany=&status=&idEventType=&dateFrom=&dateTo=&search=&page=&size=
    getEvents(idCompany: number, filters?: EventFilter): Observable<ApiResponse<PageResponse<EventResponse>>> {
        let params = new HttpParams()
            .set('idCompany', idCompany)
            .set('page', filters?.page ?? 0)
            .set('size', filters?.size ?? 20);
        if (filters?.search) params = params.set('search', filters.search);
        if (filters?.status) params = params.set('status', filters.status);
        if (filters?.idEventType) params = params.set('idEventType', filters.idEventType);
        if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
        return this.http.get<ApiResponse<PageResponse<EventResponse>>>(this.API, { params });
    }

    // GET /api/v1/events/upcoming?idCompany=&limit=
    getUpcomingEvents(idCompany: number, limit = 5): Observable<ApiResponse<EventResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany).set('limit', limit);
        return this.http.get<ApiResponse<EventResponse[]>>(`${this.API}/upcoming`, { params });
    }

    // GET /api/v1/events/{idEvent}
    getEventById(idEvent: number): Observable<ApiResponse<EventResponse>> {
        return this.http.get<ApiResponse<EventResponse>>(`${this.API}/${idEvent}`);
    }

    // POST /api/v1/events
    createEvent(request: CreateEventRequest): Observable<ApiResponse<EventResponse>> {
        return this.http.post<ApiResponse<EventResponse>>(this.API, request);
    }

    // PUT /api/v1/events/{idEvent}
    updateEvent(idEvent: number, request: UpdateEventRequest): Observable<ApiResponse<EventResponse>> {
        return this.http.put<ApiResponse<EventResponse>>(`${this.API}/${idEvent}`, request);
    }

    // PATCH /api/v1/events/{idEvent}/status?status=
    updateStatus(idEvent: number, status: string): Observable<ApiResponse<EventResponse>> {
        const params = new HttpParams().set('status', status);
        return this.http.patch<ApiResponse<EventResponse>>(`${this.API}/${idEvent}/status`, null, { params });
    }

    // DELETE /api/v1/events/{idEvent}
    deleteEvent(idEvent: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/${idEvent}`);
    }

    // GET /api/v1/events/{idEvent}/registrations
    getRegistrationsByEvent(idEvent: number): Observable<ApiResponse<EventRegistrationResponse[]>> {
        return this.http.get<ApiResponse<EventRegistrationResponse[]>>(`${this.API}/${idEvent}/registrations`);
    }

    // POST /api/v1/events/registrations
    registerStudent(request: RegisterStudentEventRequest): Observable<ApiResponse<EventRegistrationResponse>> {
        return this.http.post<ApiResponse<EventRegistrationResponse>>(`${this.API}/registrations`, request);
    }

    // PATCH /api/v1/events/registrations/{id}/attend
    markAttendance(idEventRegistration: number): Observable<ApiResponse<EventRegistrationResponse>> {
        return this.http.patch<ApiResponse<EventRegistrationResponse>>(`${this.API}/registrations/${idEventRegistration}/attend`, null);
    }

    // DELETE /api/v1/events/registrations/{id}
    cancelRegistration(idEventRegistration: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/registrations/${idEventRegistration}`);
    }

    // GET /api/v1/events/stats?idCompany=
    getStats(idCompany: number): Observable<ApiResponse<EventStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<EventStatsResponse>>(`${this.API}/stats`, { params });
    }
}
