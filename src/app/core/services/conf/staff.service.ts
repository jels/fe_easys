// src/app/core/services/conf/staff.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_STAFF, StaffMock } from '../../../shared/data/staff.mock';
import { MOCK_STAFF_ACCESS_LOGS, StaffAccessLogMock } from '../../../shared/data/operations.mock';
import { MOCK_SECTIONS, MOCK_SUBJECTS, SectionMock, SubjectMock } from '../../../shared/data/academic.mock';

export interface StaffFilter {
    search?: string;
    staffType?: string;
    status?: string;
    idBranch?: number;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
    readonly DEMO_MODE = true;
    private readonly DELAY_MS = 400;

    getAll(filters?: StaffFilter): Observable<StaffMock[]> {
        let result = [...MOCK_STAFF];

        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(
                (s) =>
                    s.fullName.toLowerCase().includes(q) ||
                    s.employeeNumber.toLowerCase().includes(q) ||
                    s.person.documentNumber.toLowerCase().includes(q) ||
                    s.position?.toLowerCase().includes(q) ||
                    s.department?.toLowerCase().includes(q) ||
                    s.person.email?.toLowerCase().includes(q)
            );
        }
        if (filters?.staffType) result = result.filter((s) => s.staffType === filters.staffType);
        if (filters?.status) result = result.filter((s) => s.status === filters.status);
        if (filters?.idBranch) result = result.filter((s) => s.idBranch === filters.idBranch);

        return of(result).pipe(delay(this.DELAY_MS));
    }

    getById(id: number): Observable<StaffMock | undefined> {
        return of(MOCK_STAFF.find((s) => s.idStaff === id)).pipe(delay(this.DELAY_MS));
    }

    getTeachers(): Observable<StaffMock[]> {
        return of(MOCK_STAFF.filter((s) => s.staffType === 'TEACHER' && s.isActive)).pipe(delay(this.DELAY_MS));
    }

    // Logs de asistencia del empleado
    getAccessLogs(idStaff: number): Observable<StaffAccessLogMock[]> {
        return of(MOCK_STAFF_ACCESS_LOGS.filter((l) => l.idStaff === idStaff).sort((a, b) => b.accessDate.localeCompare(a.accessDate))).pipe(delay(this.DELAY_MS));
    }

    // Secciones asignadas al docente (por homeroom o asignación)
    getAssignedSections(idStaff: number): Observable<SectionMock[]> {
        return of(MOCK_SECTIONS.filter((s) => s.idHomeroomTeacher === idStaff)).pipe(delay(this.DELAY_MS));
    }

    // Materias que puede dictar (por especialización)
    getAssignedSubjects(idStaff: number): Observable<SubjectMock[]> {
        const staff = MOCK_STAFF.find((s) => s.idStaff === idStaff);
        if (!staff || staff.staffType !== 'TEACHER') return of([]).pipe(delay(this.DELAY_MS));
        // Demo: devuelve materias cuyo nombre coincide con la especialización
        const spec = staff.specialization?.toLowerCase() ?? '';
        const matched = MOCK_SUBJECTS.filter((sub) => spec.includes(sub.name.toLowerCase().split(' ')[0]) || sub.name.toLowerCase().includes(spec.split(' ')[0]));
        // Si no hay match específico, devolver las primeras 3 materias como demo
        return of(matched.length ? matched : MOCK_SUBJECTS.slice(0, 3)).pipe(delay(this.DELAY_MS));
    }

    getStats(): Observable<{ total: number; teachers: number; administrative: number; onLeave: number; byType: Record<string, number> }> {
        const total = MOCK_STAFF.length;
        const teachers = MOCK_STAFF.filter((s) => s.staffType === 'TEACHER').length;
        const administrative = MOCK_STAFF.filter((s) => s.staffType === 'ADMINISTRATIVE').length;
        const onLeave = MOCK_STAFF.filter((s) => s.status === 'ON_LEAVE').length;
        const byType: Record<string, number> = {};
        MOCK_STAFF.forEach((s) => {
            byType[s.staffType] = (byType[s.staffType] ?? 0) + 1;
        });
        return of({ total, teachers, administrative, onLeave, byType }).pipe(delay(this.DELAY_MS));
    }
}
