// src/app/core/services/api/parents.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { CreateParentRequest, UpdateParentRequest } from '../../models/parent.models';
import { PageResponse, ParentResponse, StudentParentResponse } from '../../models/student.dto';

export interface ParentFilter {
    search?: string;
    page?: number;
    size?: number;
}

export interface ParentStatsResponse {
    total: number;
    financialResponsible: number;
    withMultipleStudents: number;
}

@Injectable({ providedIn: 'root' })
export class ParentsService {
    private readonly API = `${environment.apiUrl}parents`;

    constructor(private http: HttpClient) {}

    // GET /api/v1/parents?idCompany=&search=&page=&size=
    getAll(idCompany: number, filters?: ParentFilter): Observable<ApiResponse<PageResponse<ParentResponse>>> {
        let params = new HttpParams()
            .set('idCompany', idCompany)
            .set('page', filters?.page ?? 0)
            .set('size', filters?.size ?? 20);
        if (filters?.search) params = params.set('search', filters.search);
        return this.http.get<ApiResponse<PageResponse<ParentResponse>>>(this.API, { params });
    }

    // GET /api/v1/parents/{idParent}
    getById(idParent: number): Observable<ApiResponse<ParentResponse>> {
        return this.http.get<ApiResponse<ParentResponse>>(`${this.API}/${idParent}`);
    }

    // POST /api/v1/parents
    create(request: CreateParentRequest): Observable<ApiResponse<ParentResponse>> {
        return this.http.post<ApiResponse<ParentResponse>>(this.API, request);
    }

    // PUT /api/v1/parents/{idParent}
    update(idParent: number, request: UpdateParentRequest): Observable<ApiResponse<ParentResponse>> {
        return this.http.put<ApiResponse<ParentResponse>>(`${this.API}/${idParent}`, request);
    }

    // DELETE /api/v1/parents/{idParent}
    delete(idParent: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/${idParent}`);
    }

    // GET /api/v1/parents/{idParent}/students
    getStudentsByParent(idParent: number): Observable<ApiResponse<StudentParentResponse[]>> {
        return this.http.get<ApiResponse<StudentParentResponse[]>>(`${this.API}/${idParent}/students`);
    }
}
