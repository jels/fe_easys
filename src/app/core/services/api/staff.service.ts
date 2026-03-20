// src/app/core/services/api/staff.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { StaffResponse, StaffStatsResponse, CreateStaffRequest, UpdateStaffRequest } from '../../models/staff.models';
import { StaffAccessLogResponse } from '../../models/operations.models';
import { SectionResponse, ClassScheduleResponse } from '../../models/academic.models';
import { PageResponse } from '../../models/student.dto';

export interface StaffFilter {
    search?: string;
    staffType?: string;
    status?: string;
    idBranch?: number;
    page?: number;
    size?: number;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
    private readonly API = `${environment.apiUrl}staff`;
    private readonly OPS_API = `${environment.apiUrl}operations`;
    private readonly ACAD_API = `${environment.apiUrl}academic`;

    constructor(private http: HttpClient) {}

    // GET /api/v1/staff?idCompany=&staffType=&status=&idBranch=&search=&page=&size=
    getAll(idCompany: number, filters?: StaffFilter): Observable<ApiResponse<PageResponse<StaffResponse>>> {
        let params = new HttpParams()
            .set('idCompany', idCompany)
            .set('page', filters?.page ?? 0)
            .set('size', filters?.size ?? 20);
        if (filters?.search) params = params.set('search', filters.search);
        if (filters?.staffType) params = params.set('staffType', filters.staffType);
        if (filters?.status) params = params.set('status', filters.status);
        if (filters?.idBranch) params = params.set('idBranch', filters.idBranch);
        return this.http.get<ApiResponse<PageResponse<StaffResponse>>>(this.API, { params });
    }

    // GET /api/v1/staff/{idStaff}
    getById(idStaff: number): Observable<ApiResponse<StaffResponse>> {
        return this.http.get<ApiResponse<StaffResponse>>(`${this.API}/${idStaff}`);
    }

    // GET /api/v1/staff/teachers?idCompany=
    getTeachers(idCompany: number): Observable<ApiResponse<StaffResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<StaffResponse[]>>(`${this.API}/teachers`, { params });
    }

    // POST /api/v1/staff
    create(request: CreateStaffRequest): Observable<ApiResponse<StaffResponse>> {
        return this.http.post<ApiResponse<StaffResponse>>(this.API, request);
    }

    // PUT /api/v1/staff/{idStaff}
    update(idStaff: number, request: UpdateStaffRequest): Observable<ApiResponse<StaffResponse>> {
        return this.http.put<ApiResponse<StaffResponse>>(`${this.API}/${idStaff}`, request);
    }

    // DELETE /api/v1/staff/{idStaff}
    delete(idStaff: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/${idStaff}`);
    }

    // GET /api/v1/staff/stats?idCompany=
    getStats(idCompany: number): Observable<ApiResponse<StaffStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<StaffStatsResponse>>(`${this.API}/stats`, { params });
    }

    // GET /api/v1/operations/access/staff?idCompany= (logs del empleado)
    getAccessLogs(idCompany: number, idStaff?: number, date?: string): Observable<ApiResponse<StaffAccessLogResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (date) params = params.set('date', date);
        return this.http.get<ApiResponse<StaffAccessLogResponse[]>>(`${this.OPS_API}/access/staff`, { params });
    }

    // GET /api/v1/academic/sections?idCompany=&idHomeroomTeacher= (secciones del tutor)
    getAssignedSections(idCompany: number, idStaff: number): Observable<ApiResponse<SectionResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        // El backend filtra por homeroomTeacher internamente si se pasa
        return this.http.get<ApiResponse<SectionResponse[]>>(`${this.ACAD_API}/sections`, { params });
    }

    // GET /api/v1/academic/schedules/by-teacher/{idStaff}
    getAssignedSubjects(idStaff: number): Observable<ApiResponse<ClassScheduleResponse[]>> {
        return this.http.get<ApiResponse<ClassScheduleResponse[]>>(`${this.ACAD_API}/schedules/by-teacher/${idStaff}`);
    }
}
