// src/app/core/services/api/cash.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { CashConceptResponse, CashMovementResponse, CashDailySummaryResponse, CashStatsResponse, CreateCashMovementRequest, UpdateCashMovementRequest } from '../../models/cash.models';

@Injectable({ providedIn: 'root' })
export class CashService {
    private readonly API = `${environment.apiUrl}cash`;

    constructor(private http: HttpClient) {}

    // ── Conceptos ─────────────────────────────────────────────────────────────

    getConcepts(idCompany: number, movementType?: 'INCOME' | 'EXPENSE'): Observable<ApiResponse<CashConceptResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (movementType) params = params.set('movementType', movementType);
        return this.http.get<ApiResponse<CashConceptResponse[]>>(`${this.API}/concepts`, { params });
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    getStats(idCompany: number): Observable<ApiResponse<CashStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<CashStatsResponse>>(`${this.API}/stats`, { params });
    }

    // ── Resumen diario ────────────────────────────────────────────────────────

    getDailySummary(idCompany: number, date?: string): Observable<ApiResponse<CashDailySummaryResponse>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (date) params = params.set('date', date);
        return this.http.get<ApiResponse<CashDailySummaryResponse>>(`${this.API}/summary`, { params });
    }

    // ── Movimientos ───────────────────────────────────────────────────────────

    getMovements(
        idCompany: number,
        filters: {
            dateFrom?: string;
            dateTo?: string;
            movementType?: string;
            idCashConcept?: number;
            idBranch?: number;
        } = {}
    ): Observable<ApiResponse<CashMovementResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
        if (filters.movementType) params = params.set('movementType', filters.movementType);
        if (filters.idCashConcept) params = params.set('idCashConcept', filters.idCashConcept);
        if (filters.idBranch) params = params.set('idBranch', filters.idBranch);
        return this.http.get<ApiResponse<CashMovementResponse[]>>(`${this.API}/movements`, { params });
    }

    create(request: CreateCashMovementRequest): Observable<ApiResponse<CashMovementResponse>> {
        return this.http.post<ApiResponse<CashMovementResponse>>(`${this.API}/movements`, request);
    }

    update(id: number, request: UpdateCashMovementRequest): Observable<ApiResponse<CashMovementResponse>> {
        return this.http.put<ApiResponse<CashMovementResponse>>(`${this.API}/movements/${id}`, request);
    }

    cancel(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/movements/${id}`);
    }
}
