import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';
import { GradeDTO, BranchDTO, SectionDTO } from '../../models/dto/academic.dto';

@Injectable({ providedIn: 'root' })
export class AcademicsApiService extends BaseApiService {
    // Grades
    getAllGrades(): Observable<ApiResponse<GradeDTO[]>> {
        return this.get<GradeDTO[]>('grades');
    }

    getGradeById(id: number): Observable<ApiResponse<GradeDTO>> {
        return this.get<GradeDTO>(`grades/${id}`);
    }

    createGrade(request: Partial<GradeDTO>): Observable<ApiResponse<GradeDTO>> {
        return this.post<GradeDTO>('grades', request);
    }

    updateGrade(id: number, request: Partial<GradeDTO>): Observable<ApiResponse<GradeDTO>> {
        return this.put<GradeDTO>(`grades/${id}`, request);
    }

    toggleGrade(id: number): Observable<ApiResponse<GradeDTO>> {
        return this.patch<GradeDTO>(`grades/${id}/toggle-active`);
    }

    // Sections
    getAllSections(): Observable<ApiResponse<SectionDTO[]>> {
        return this.get<SectionDTO[]>('sections');
    }

    getSectionsByGrade(idGrade: number): Observable<ApiResponse<SectionDTO[]>> {
        return this.get<SectionDTO[]>('sections', { idGrade });
    }

    // Branches
    getAllBranches(): Observable<ApiResponse<BranchDTO[]>> {
        return this.get<BranchDTO[]>('branches');
    }
}
