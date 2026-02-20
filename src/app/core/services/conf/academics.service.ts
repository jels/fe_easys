// src/app/core/services/conf/academics.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_SCHOOL_YEARS, MOCK_SCHOOL_PERIODS, MOCK_GRADES, MOCK_SECTIONS, MOCK_SUBJECTS, SchoolYearMock, SchoolPeriodMock, GradeMock, SectionMock, SubjectMock } from '../../../shared/data/academic.mock';

@Injectable({ providedIn: 'root' })
export class AcademicsService {
    readonly DEMO_MODE = true;
    private readonly DELAY_MS = 300;

    getSchoolYears(): Observable<SchoolYearMock[]> {
        return of(MOCK_SCHOOL_YEARS).pipe(delay(this.DELAY_MS));
    }

    getActiveSchoolYear(): Observable<SchoolYearMock | undefined> {
        return of(MOCK_SCHOOL_YEARS.find((y) => y.isActive)).pipe(delay(this.DELAY_MS));
    }

    getSchoolPeriods(idSchoolYear?: number): Observable<SchoolPeriodMock[]> {
        let result = [...MOCK_SCHOOL_PERIODS];
        if (idSchoolYear) result = result.filter((p) => p.idSchoolYear === idSchoolYear);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    getGrades(level?: string): Observable<GradeMock[]> {
        let result = [...MOCK_GRADES].filter((g) => g.isActive);
        if (level) result = result.filter((g) => g.level === level);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    getSections(idGrade?: number, idSchoolYear?: number): Observable<SectionMock[]> {
        let result = [...MOCK_SECTIONS].filter((s) => s.isActive);
        if (idGrade) result = result.filter((s) => s.idGrade === idGrade);
        if (idSchoolYear) result = result.filter((s) => s.idSchoolYear === idSchoolYear);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    getSubjects(): Observable<SubjectMock[]> {
        return of(MOCK_SUBJECTS.filter((s) => s.isActive)).pipe(delay(this.DELAY_MS));
    }
}
