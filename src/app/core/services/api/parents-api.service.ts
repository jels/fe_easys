import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';
import { ParentDTO, ParentRequest, StudentParentDTO, StudentParentRequest } from '../../models/dto/parent.dto';

@Injectable({ providedIn: 'root' })
export class ParentsApiService extends BaseApiService {
    private readonly endpoint = 'parents';

    getAll(): Observable<ApiResponse<ParentDTO[]>> {
        return this.get<ParentDTO[]>(this.endpoint);
    }

    getById(id: number): Observable<ApiResponse<ParentDTO>> {
        return this.get<ParentDTO>(`${this.endpoint}/${id}`);
    }

    getByStudent(idStudent: number): Observable<ApiResponse<ParentDTO[]>> {
        return this.get<ParentDTO[]>(`${this.endpoint}/student/${idStudent}`);
    }

    search(query: string): Observable<ApiResponse<ParentDTO[]>> {
        return this.get<ParentDTO[]>(`${this.endpoint}/search`, { q: query });
    }

    create(request: ParentRequest): Observable<ApiResponse<ParentDTO>> {
        return this.post<ParentDTO>(this.endpoint, request);
    }

    update(id: number, request: ParentRequest): Observable<ApiResponse<ParentDTO>> {
        return this.put<ParentDTO>(`${this.endpoint}/${id}`, request);
    }

    toggleActive(id: number): Observable<ApiResponse<ParentDTO>> {
        return this.patch<ParentDTO>(`${this.endpoint}/${id}/toggle-active`);
    }

    // Student-Parent relations
    linkStudentParent(request: StudentParentRequest): Observable<ApiResponse<StudentParentDTO>> {
        return this.post<StudentParentDTO>('student-parents', request);
    }

    unlinkStudentParent(idStudentParent: number): Observable<ApiResponse<void>> {
        return this.delete<void>(`student-parents/${idStudentParent}`);
    }

    getStudentParents(idStudent: number): Observable<ApiResponse<StudentParentDTO[]>> {
        return this.get<StudentParentDTO[]>(`student-parents/student/${idStudent}`);
    }
}
