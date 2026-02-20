import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';
import { StudentDTO, StudentRequest, StudentSummaryDTO } from '../../models/dto/student.dto';

@Injectable({ providedIn: 'root' })
export class StudentsApiService extends BaseApiService {
    private readonly endpoint = 'students';

    getAll(): Observable<ApiResponse<StudentDTO[]>> {
        return this.get<StudentDTO[]>(this.endpoint);
    }

    getById(id: number): Observable<ApiResponse<StudentDTO>> {
        return this.get<StudentDTO>(`${this.endpoint}/${id}`);
    }

    getByCompany(idCompany: number): Observable<ApiResponse<StudentDTO[]>> {
        return this.get<StudentDTO[]>(this.endpoint, { idCompany });
    }

    getSummaries(): Observable<ApiResponse<StudentSummaryDTO[]>> {
        return this.get<StudentSummaryDTO[]>(`${this.endpoint}/summary`);
    }

    search(query: string): Observable<ApiResponse<StudentDTO[]>> {
        return this.get<StudentDTO[]>(`${this.endpoint}/search`, { q: query });
    }

    create(request: StudentRequest): Observable<ApiResponse<StudentDTO>> {
        return this.post<StudentDTO>(this.endpoint, request);
    }

    update(id: number, request: StudentRequest): Observable<ApiResponse<StudentDTO>> {
        return this.put<StudentDTO>(`${this.endpoint}/${id}`, request);
    }

    toggleActive(id: number): Observable<ApiResponse<StudentDTO>> {
        return this.patch<StudentDTO>(`${this.endpoint}/${id}/toggle-active`);
    }

    deleted(id: number): Observable<ApiResponse<void>> {
        return this.delete<void>(`${this.endpoint}/${id}`);
    }
}
