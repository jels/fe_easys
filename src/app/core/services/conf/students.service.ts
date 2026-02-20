// src/app/core/services/conf/students.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_STUDENTS, MOCK_STUDENT_PARENTS, StudentMock, StudentParentMock } from '../../../shared/data/people.mock';

export interface StudentFilter {
    search?: string;
    status?: string;
    idGrade?: number;
    idSection?: number;
    idBranch?: number;
}

@Injectable({ providedIn: 'root' })
export class StudentsService {
    readonly DEMO_MODE = true;
    private readonly DELAY_MS = 400;

    // Estado reactivo local
    loading = signal(false);

    getAll(filters?: StudentFilter): Observable<StudentMock[]> {
        let result = [...MOCK_STUDENTS];

        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((s) => s.fullName.toLowerCase().includes(q) || s.enrollmentNumber.toLowerCase().includes(q) || s.person.documentNumber.toLowerCase().includes(q) || s.person.email?.toLowerCase().includes(q));
        }
        if (filters?.status) result = result.filter((s) => s.status === filters.status);
        if (filters?.idGrade) result = result.filter((s) => s.idCurrentGrade === filters.idGrade);
        if (filters?.idSection) result = result.filter((s) => s.idCurrentSection === filters.idSection);
        if (filters?.idBranch) result = result.filter((s) => s.idBranch === filters.idBranch);

        return of(result).pipe(delay(this.DELAY_MS));
    }

    getById(id: number): Observable<StudentMock | undefined> {
        const student = MOCK_STUDENTS.find((s) => s.idStudent === id);
        return of(student).pipe(delay(this.DELAY_MS));
    }

    getParentsByStudent(idStudent: number): Observable<StudentParentMock[]> {
        const parents = MOCK_STUDENT_PARENTS.filter((sp) => sp.idStudent === idStudent);
        return of(parents).pipe(delay(this.DELAY_MS));
    }

    // Estadísticas rápidas para dashboard
    getStats(): Observable<{ total: number; active: number; inactive: number; byGrade: Record<string, number> }> {
        const total = MOCK_STUDENTS.length;
        const active = MOCK_STUDENTS.filter((s) => s.status === 'ACTIVE').length;
        const inactive = MOCK_STUDENTS.filter((s) => s.status !== 'ACTIVE').length;

        const byGrade = MOCK_STUDENTS.reduce(
            (acc, s) => {
                acc[s.gradeName] = (acc[s.gradeName] ?? 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return of({ total, active, inactive, byGrade }).pipe(delay(this.DELAY_MS));
    }
}
