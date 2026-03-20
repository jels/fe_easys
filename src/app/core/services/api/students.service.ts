// src/app/core/services/api/students.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { StudentFilter, StudentResponse, StudentParentResponse, StudentStatsResponse, PageResponse, CreateStudentRequest, UpdateStudentRequest, LinkStudentParentRequest } from '../../models/student.dto';

@Injectable({ providedIn: 'root' })
export class StudentsService {
    private readonly API = `${environment.apiUrl}students`;

    constructor(private http: HttpClient) {}

    // ── GET paginado con filtros ───────────────────────────────────────────────
    // GET /api/v1/students?idCompany=&page=&size=&search=&status=&idGrade=&idSection=

    getAll(idCompany: number, filters?: StudentFilter): Observable<ApiResponse<PageResponse<StudentResponse>>> {
        let params = new HttpParams()
            .set('idCompany', idCompany)
            .set('page', filters?.page ?? 0)
            .set('size', filters?.size ?? 20);

        if (filters?.search) params = params.set('search', filters.search);
        if (filters?.status) params = params.set('status', filters.status);
        if (filters?.idGrade) params = params.set('idGrade', filters.idGrade);
        if (filters?.idSection) params = params.set('idSection', filters.idSection);
        if (filters?.idBranch) params = params.set('idBranch', filters.idBranch);

        return this.http.get<ApiResponse<PageResponse<StudentResponse>>>(this.API, { params });
    }

    // ── GET por ID ────────────────────────────────────────────────────────────
    // GET /api/v1/students/{idStudent}

    getById(idStudent: number): Observable<ApiResponse<StudentResponse>> {
        return this.http.get<ApiResponse<StudentResponse>>(`${this.API}/${idStudent}`);
    }

    // ── GET por sección ───────────────────────────────────────────────────────
    // GET /api/v1/students/by-section/{idSection}

    getBySection(idSection: number): Observable<ApiResponse<StudentResponse[]>> {
        return this.http.get<ApiResponse<StudentResponse[]>>(`${this.API}/by-section/${idSection}`);
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    // POST /api/v1/students

    create(request: CreateStudentRequest): Observable<ApiResponse<StudentResponse>> {
        return this.http.post<ApiResponse<StudentResponse>>(this.API, request);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    // PUT /api/v1/students/{idStudent}

    update(idStudent: number, request: UpdateStudentRequest): Observable<ApiResponse<StudentResponse>> {
        return this.http.put<ApiResponse<StudentResponse>>(`${this.API}/${idStudent}`, request);
    }

    // ── DELETE (soft) ─────────────────────────────────────────────────────────
    // DELETE /api/v1/students/{idStudent}

    delete(idStudent: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/${idStudent}`);
    }

    // ── Padres del alumno ─────────────────────────────────────────────────────
    // GET /api/v1/students/{idStudent}/parents

    getParents(idStudent: number): Observable<ApiResponse<StudentParentResponse[]>> {
        return this.http.get<ApiResponse<StudentParentResponse[]>>(`${this.API}/${idStudent}/parents`);
    }

    // POST /api/v1/students/link-parent

    linkParent(request: LinkStudentParentRequest): Observable<ApiResponse<StudentParentResponse>> {
        return this.http.post<ApiResponse<StudentParentResponse>>(`${this.API}/link-parent`, request);
    }

    // DELETE /api/v1/students/unlink-parent/{idStudentParent}

    unlinkParent(idStudentParent: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/unlink-parent/${idStudentParent}`);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    // GET /api/v1/students/stats?idCompany=

    getStats(idCompany: number): Observable<ApiResponse<StudentStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<StudentStatsResponse>>(`${this.API}/stats`, { params });
    }
}
