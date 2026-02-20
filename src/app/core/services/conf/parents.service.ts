// src/app/core/services/conf/parents.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_PARENTS, MOCK_STUDENT_PARENTS, ParentMock, StudentParentMock } from '../../../shared/data/people.mock';
import { MOCK_STUDENTS } from '../../../shared/data/people.mock';
import { StudentMock } from '../../../shared/data/people.mock';

export interface ParentFilter {
    search?: string;
    isFinancialResponsible?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ParentsService {
    readonly DEMO_MODE = true;
    private readonly DELAY_MS = 400;

    getAll(filters?: ParentFilter): Observable<ParentMock[]> {
        let result = [...MOCK_PARENTS];

        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((p) => p.fullName.toLowerCase().includes(q) || p.person.documentNumber.toLowerCase().includes(q) || p.person.email?.toLowerCase().includes(q) || p.person.mobilePhone?.toLowerCase().includes(q));
        }

        if (filters?.isFinancialResponsible !== undefined) {
            result = result.filter((p) => p.isFinancialResponsible === filters.isFinancialResponsible);
        }

        return of(result).pipe(delay(this.DELAY_MS));
    }

    getById(id: number): Observable<ParentMock | undefined> {
        return of(MOCK_PARENTS.find((p) => p.idParent === id)).pipe(delay(this.DELAY_MS));
    }

    // Estudiantes vinculados a este padre
    getStudentsByParent(idParent: number): Observable<{ relation: StudentParentMock; student: StudentMock }[]> {
        const relations = MOCK_STUDENT_PARENTS.filter((sp) => sp.idParent === idParent && sp.isActive);
        const result = relations
            .map((rel) => ({
                relation: rel,
                student: MOCK_STUDENTS.find((s) => s.idStudent === rel.idStudent)!
            }))
            .filter((r) => !!r.student);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    // Todos los alumnos disponibles para vincular (los que aún no están vinculados)
    getAvailableStudentsForParent(idParent: number): Observable<StudentMock[]> {
        const linkedIds = MOCK_STUDENT_PARENTS.filter((sp) => sp.idParent === idParent && sp.isActive).map((sp) => sp.idStudent);
        const available = MOCK_STUDENTS.filter((s) => !linkedIds.includes(s.idStudent) && s.isActive);
        return of(available).pipe(delay(this.DELAY_MS));
    }

    getStats(): Observable<{ total: number; financialResponsible: number; withMultipleStudents: number }> {
        const total = MOCK_PARENTS.length;
        const financialResponsible = MOCK_PARENTS.filter((p) => p.isFinancialResponsible).length;
        // padres con más de 1 alumno vinculado
        const withMultipleStudents = MOCK_PARENTS.filter((p) => MOCK_STUDENT_PARENTS.filter((sp) => sp.idParent === p.idParent).length > 1).length;
        return of({ total, financialResponsible, withMultipleStudents }).pipe(delay(this.DELAY_MS));
    }
}
