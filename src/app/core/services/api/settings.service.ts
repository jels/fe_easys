import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { BranchResponse, CompanyResponse, SchoolPeriodResponse, SchoolYearResponse, SettingsStatsResponse, SystemParamResponse } from '../../models/settings.models';

// ── Requests — mismos campos que el mock, alineados con el backend ─────────────

export interface UpdateCompanyRequest {
    name: string;
    legalName: string; // era tradeName en el mock
    ruc: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
}

export interface UpsertBranchRequest {
    idBranch?: number; // null → crear, con valor → actualizar
    idCompany: number;
    name: string;
    code: string;
    address?: string;
    phone?: string;
    isMain: boolean;
}

export interface CreateSchoolYearRequest {
    idCompany: number;
    name: string;
    startDate: string;
    endDate: string;
}

export interface CreatePeriodRequest {
    idSchoolYear: number;
    name: string;
    periodNumber: number;
    startDate: string;
    endDate: string;
}

export interface UpdateSystemParamRequest {
    paramValue: string;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private readonly API = `${environment.apiUrl}settings`;

    constructor(private http: HttpClient) {}

    // ── Empresa ───────────────────────────────────────────────────────────────
    // GET /api/v1/settings/company/{idCompany}

    getCompany(idCompany: number): Observable<ApiResponse<CompanyResponse>> {
        return this.http.get<ApiResponse<CompanyResponse>>(`${this.API}/company/${idCompany}`);
    }

    // PUT /api/v1/settings/company/{idCompany}

    updateCompany(idCompany: number, request: UpdateCompanyRequest): Observable<ApiResponse<CompanyResponse>> {
        return this.http.put<ApiResponse<CompanyResponse>>(`${this.API}/company/${idCompany}`, request);
    }

    // ── Sucursales ────────────────────────────────────────────────────────────
    // GET /api/v1/settings/branches?idCompany=

    getBranches(idCompany: number): Observable<ApiResponse<BranchResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<BranchResponse[]>>(`${this.API}/branches`, { params });
    }

    // POST /api/v1/settings/branches

    createBranch(request: UpsertBranchRequest): Observable<ApiResponse<BranchResponse>> {
        const body = { ...request, idBranch: undefined }; // forzar create
        return this.http.post<ApiResponse<BranchResponse>>(`${this.API}/branches`, body);
    }

    // PUT /api/v1/settings/branches/{idBranch}

    updateBranch(idBranch: number, request: UpsertBranchRequest): Observable<ApiResponse<BranchResponse>> {
        return this.http.put<ApiResponse<BranchResponse>>(`${this.API}/branches/${idBranch}`, request);
    }

    // saveBranch — alias que replica el comportamiento del mock (upsert)

    saveBranch(request: UpsertBranchRequest): Observable<ApiResponse<BranchResponse>> {
        return request.idBranch ? this.updateBranch(request.idBranch, request) : this.createBranch(request);
    }

    // DELETE /api/v1/settings/branches/{idBranch}

    deleteBranch(idBranch: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/branches/${idBranch}`);
    }

    // ── Años lectivos ─────────────────────────────────────────────────────────
    // GET /api/v1/settings/school-years?idCompany=

    getSchoolYears(idCompany: number): Observable<ApiResponse<SchoolYearResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<SchoolYearResponse[]>>(`${this.API}/school-years`, { params });
    }

    // GET /api/v1/settings/school-years/{idSchoolYear}  (con períodos incluidos)

    getSchoolYearWithPeriods(idSchoolYear: number): Observable<ApiResponse<SchoolYearResponse>> {
        return this.http.get<ApiResponse<SchoolYearResponse>>(`${this.API}/school-years/${idSchoolYear}`);
    }

    // POST /api/v1/settings/school-years

    createSchoolYear(request: CreateSchoolYearRequest): Observable<ApiResponse<SchoolYearResponse>> {
        return this.http.post<ApiResponse<SchoolYearResponse>>(`${this.API}/school-years`, request);
    }

    // PATCH /api/v1/settings/school-years/{idSchoolYear}/toggle-active

    toggleYearActive(idSchoolYear: number, isActive: boolean): Observable<ApiResponse<SchoolYearResponse>> {
        const params = new HttpParams().set('isActive', isActive);
        return this.http.patch<ApiResponse<SchoolYearResponse>>(`${this.API}/school-years/${idSchoolYear}/toggle-active`, null, { params });
    }

    // ── Períodos ──────────────────────────────────────────────────────────────
    // GET /api/v1/settings/school-years/{idSchoolYear}/periods

    getPeriodsByYear(idSchoolYear: number): Observable<ApiResponse<SchoolPeriodResponse[]>> {
        return this.http.get<ApiResponse<SchoolPeriodResponse[]>>(`${this.API}/school-years/${idSchoolYear}/periods`);
    }

    // POST /api/v1/settings/school-years/{idSchoolYear}/periods

    createPeriod(request: CreatePeriodRequest): Observable<ApiResponse<SchoolPeriodResponse>> {
        return this.http.post<ApiResponse<SchoolPeriodResponse>>(`${this.API}/school-years/${request.idSchoolYear}/periods`, request);
    }

    // PATCH /api/v1/settings/periods/{idSchoolPeriod}/toggle-active

    togglePeriodActive(idSchoolPeriod: number, isActive: boolean): Observable<ApiResponse<SchoolPeriodResponse>> {
        const params = new HttpParams().set('isActive', isActive);
        return this.http.patch<ApiResponse<SchoolPeriodResponse>>(`${this.API}/periods/${idSchoolPeriod}/toggle-active`, null, { params });
    }

    // ── Parámetros del sistema ────────────────────────────────────────────────
    // GET /api/v1/settings/params?idCompany=&category=

    getParams(idCompany: number, category?: string): Observable<ApiResponse<SystemParamResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (category) params = params.set('category', category);
        return this.http.get<ApiResponse<SystemParamResponse[]>>(`${this.API}/params`, { params });
    }

    // PATCH /api/v1/settings/params/{idParam}

    updateParam(idParam: number, newValue: string): Observable<ApiResponse<SystemParamResponse>> {
        const request: UpdateSystemParamRequest = { paramValue: newValue };
        return this.http.patch<ApiResponse<SystemParamResponse>>(`${this.API}/params/${idParam}`, request);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    // GET /api/v1/settings/stats?idCompany=

    getSettingsStats(idCompany: number): Observable<ApiResponse<SettingsStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<SettingsStatsResponse>>(`${this.API}/stats`, { params });
    }
}
