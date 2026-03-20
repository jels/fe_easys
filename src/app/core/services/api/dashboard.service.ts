// src/app/core/services/api/dashboard.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { DashboardStatsResponse } from '../../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly API = `${environment.apiUrl}dashboard`;

    constructor(private http: HttpClient) {}

    // GET /api/v1/dashboard?idCompany=
    // Devuelve TODOS los datos del dashboard en una sola llamada:
    // stats de personas, asistencia, académico, financiero, operaciones,
    // QR, y arrays para charts (últimos 7 días, últimos 6 meses, etc.)
    getStats(idCompany: number): Observable<ApiResponse<DashboardStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<DashboardStatsResponse>>(this.API, { params });
    }
}
