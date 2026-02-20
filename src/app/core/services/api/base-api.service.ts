import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

export abstract class BaseApiService {
    protected readonly http = inject(HttpClient);
    protected readonly baseUrl = environment.apiUrl;

    protected get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<ApiResponse<T>> {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }
        return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
    }

    protected post<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
        return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body);
    }

    protected put<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
        return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body);
    }

    protected patch<T>(endpoint: string, body?: unknown): Observable<ApiResponse<T>> {
        return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body ?? {});
    }

    protected delete<T>(endpoint: string): Observable<ApiResponse<T>> {
        return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`);
    }
}
