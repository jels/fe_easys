import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';
import { StaffDTO, StaffRequest, StaffSummaryDTO } from '../../models/dto/staff.dto';

@Injectable({ providedIn: 'root' })
export class StaffApiService extends BaseApiService {
    private readonly endpoint = 'staff';

    getAll(): Observable<ApiResponse<StaffDTO[]>> {
        return this.get<StaffDTO[]>(this.endpoint);
    }

    getById(id: number): Observable<ApiResponse<StaffDTO>> {
        return this.get<StaffDTO>(`${this.endpoint}/${id}`);
    }

    getByCompany(idCompany: number): Observable<ApiResponse<StaffDTO[]>> {
        return this.get<StaffDTO[]>(this.endpoint, { idCompany });
    }

    getTeachers(): Observable<ApiResponse<StaffSummaryDTO[]>> {
        return this.get<StaffSummaryDTO[]>(`${this.endpoint}/teachers`);
    }

    getSummaries(): Observable<ApiResponse<StaffSummaryDTO[]>> {
        return this.get<StaffSummaryDTO[]>(`${this.endpoint}/summary`);
    }

    search(query: string): Observable<ApiResponse<StaffDTO[]>> {
        return this.get<StaffDTO[]>(`${this.endpoint}/search`, { q: query });
    }

    create(request: StaffRequest): Observable<ApiResponse<StaffDTO>> {
        return this.post<StaffDTO>(this.endpoint, request);
    }

    update(id: number, request: StaffRequest): Observable<ApiResponse<StaffDTO>> {
        return this.put<StaffDTO>(`${this.endpoint}/${id}`, request);
    }

    toggleActive(id: number): Observable<ApiResponse<StaffDTO>> {
        return this.patch<StaffDTO>(`${this.endpoint}/${id}/toggle-active`);
    }

    deleted(id: number): Observable<ApiResponse<void>> {
        return this.delete<void>(`${this.endpoint}/${id}`);
    }
}
