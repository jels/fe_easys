import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { QrScanResultResponse, QrAccessLogResponse, QrDaySummaryResponse, RegisterQrAccessRequest } from '../../models/qr.models';

export type AccessMode = 'ENTRADA' | 'RETIRO' | 'SALIDA';

@Injectable({ providedIn: 'root' })
export class QrAccessService {
    private readonly API = `${environment.apiUrl}qr`;

    constructor(private http: HttpClient) {}

    // POST /api/v1/qr/scan
    // Valida token, aplica regla outside/inside/retired y registra el log
    scan(token: string, mode: AccessMode, idCompany: number, idRegisteredByStaff?: number, deviceInfo?: string): Observable<ApiResponse<QrScanResultResponse>> {
        const request: RegisterQrAccessRequest = {
            idCompany,
            token,
            mode,
            idRegisteredByStaff,
            deviceInfo
        };
        return this.http.post<ApiResponse<QrScanResultResponse>>(`${this.API}/scan`, request);
    }

    // GET /api/v1/qr/logs/today?idCompany=&mode=
    getTodayLogs(idCompany: number, mode?: AccessMode): Observable<ApiResponse<QrAccessLogResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (mode) params = params.set('mode', mode);
        return this.http.get<ApiResponse<QrAccessLogResponse[]>>(`${this.API}/logs/today`, { params });
    }

    // GET /api/v1/qr/logs/by-person?personType=&idPerson=
    getLogsByPerson(personType: string, idPerson: number): Observable<ApiResponse<QrAccessLogResponse[]>> {
        const params = new HttpParams().set('personType', personType).set('idPerson', idPerson);
        return this.http.get<ApiResponse<QrAccessLogResponse[]>>(`${this.API}/logs/by-person`, { params });
    }

    // GET /api/v1/qr/logs/by-date?idCompany=&date=
    getLogsByDate(idCompany: number, date: string): Observable<ApiResponse<QrAccessLogResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany).set('date', date);
        return this.http.get<ApiResponse<QrAccessLogResponse[]>>(`${this.API}/logs/by-date`, { params });
    }

    // GET /api/v1/qr/summary?idCompany=
    getDaySummary(idCompany: number): Observable<ApiResponse<QrDaySummaryResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<QrDaySummaryResponse>>(`${this.API}/summary`, { params });
    }
}
