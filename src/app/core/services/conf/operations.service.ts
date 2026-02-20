// src/app/core/services/conf/operations.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
    MOCK_STUDENT_ACCESS_LOGS,
    MOCK_STAFF_ACCESS_LOGS,
    MOCK_STUDENT_INFRACTIONS,
    MOCK_EARLY_DEPARTURES,
    MOCK_GRADE_SCORES,
    MOCK_EVENTS,
    MOCK_INFRACTION_TYPES,
    StudentAccessLogMock,
    StaffAccessLogMock,
    StudentInfractionMock,
    EarlyDepartureMock,
    GradeScoreMock,
    EventMock,
    InfractionTypeMock
} from '../../../shared/data/operations.mock';

@Injectable({ providedIn: 'root' })
export class OperationsService {
    readonly DEMO_MODE = true;
    private readonly DELAY_MS = 400;

    // ── Access Logs ───────────────────────────────────────────────────────────
    getStudentAccessLogs(date?: string, idStudent?: number): Observable<StudentAccessLogMock[]> {
        let result = [...MOCK_STUDENT_ACCESS_LOGS];
        if (date) result = result.filter((l) => l.accessDate === date);
        if (idStudent) result = result.filter((l) => l.idStudent === idStudent);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    getStaffAccessLogs(date?: string): Observable<StaffAccessLogMock[]> {
        let result = [...MOCK_STAFF_ACCESS_LOGS];
        if (date) result = result.filter((l) => l.accessDate === date);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    getTodayAbsents(): Observable<StudentAccessLogMock[]> {
        const today = new Date().toISOString().split('T')[0];
        return of(MOCK_STUDENT_ACCESS_LOGS.filter((l) => l.accessDate === today && l.isAbsent)).pipe(delay(this.DELAY_MS));
    }

    // ── Infractions ───────────────────────────────────────────────────────────
    getInfractionTypes(): Observable<InfractionTypeMock[]> {
        return of(MOCK_INFRACTION_TYPES.filter((t) => t.isActive)).pipe(delay(this.DELAY_MS));
    }

    getInfractions(idStudent?: number): Observable<StudentInfractionMock[]> {
        let result = [...MOCK_STUDENT_INFRACTIONS];
        if (idStudent) result = result.filter((i) => i.idStudent === idStudent);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    getRecentInfractions(limit = 5): Observable<StudentInfractionMock[]> {
        return of([...MOCK_STUDENT_INFRACTIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)).pipe(delay(this.DELAY_MS));
    }

    // ── Early Departures ──────────────────────────────────────────────────────
    getEarlyDepartures(idStudent?: number): Observable<EarlyDepartureMock[]> {
        let result = [...MOCK_EARLY_DEPARTURES];
        if (idStudent) result = result.filter((d) => d.idStudent === idStudent);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    // ── Grade Scores ──────────────────────────────────────────────────────────
    getScoresByStudent(idStudentEnrollment: number): Observable<GradeScoreMock[]> {
        return of(MOCK_GRADE_SCORES.filter((s) => s.idStudentEnrollment === idStudentEnrollment)).pipe(delay(this.DELAY_MS));
    }

    getScoresByPeriod(idSchoolPeriod: number): Observable<GradeScoreMock[]> {
        return of(MOCK_GRADE_SCORES.filter((s) => s.idSchoolPeriod === idSchoolPeriod)).pipe(delay(this.DELAY_MS));
    }

    // ── Events ────────────────────────────────────────────────────────────────
    getEvents(status?: string): Observable<EventMock[]> {
        let result = [...MOCK_EVENTS];
        if (status) result = result.filter((e) => e.status === status);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    getUpcomingEvents(limit = 5): Observable<EventMock[]> {
        const today = new Date().toISOString().split('T')[0];
        return of(
            [...MOCK_EVENTS]
                .filter((e) => e.eventDate >= today && e.status !== 'CANCELLED')
                .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
                .slice(0, limit)
        ).pipe(delay(this.DELAY_MS));
    }

    // ── Dashboard Stats ───────────────────────────────────────────────────────
    getDashboardStats(): Observable<{
        presentToday: number;
        absentToday: number;
        lateToday: number;
        infractionsPending: number;
        earlyDeparturesToday: number;
        upcomingEvents: number;
    }> {
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = MOCK_STUDENT_ACCESS_LOGS.filter((l) => l.accessDate === today);

        return of({
            presentToday: todayLogs.filter((l) => !l.isAbsent).length,
            absentToday: todayLogs.filter((l) => l.isAbsent).length,
            lateToday: todayLogs.filter((l) => l.isLate).length,
            infractionsPending: MOCK_STUDENT_INFRACTIONS.filter((i) => !i.parentNotified).length,
            earlyDeparturesToday: MOCK_EARLY_DEPARTURES.filter((d) => d.departureDatetime.startsWith(today)).length,
            upcomingEvents: MOCK_EVENTS.filter((e) => e.eventDate >= today && e.status !== 'CANCELLED').length
        }).pipe(delay(this.DELAY_MS));
    }
}
