import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MOCK_EVENTS, EventMock, EventRegistrationMock, MOCK_EVENT_REGISTRATIONS, EventTypeMock, MOCK_EVENT_TYPES } from '../../../shared/data/operations.mock';

import { MOCK_STUDENTS, StudentMock } from '../../../shared/data/people.mock';

export interface EventFilter {
    search?: string;
    status?: string;
    idEventType?: number;
    scope?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface CreateEventRequest {
    idEventType: number;
    idSchoolYear: number;
    name: string;
    description?: string;
    eventDate: string;
    eventTime?: string;
    endDate?: string;
    endTime?: string;
    location?: string;
    scope: string;
    maxParticipants?: number;
    requiresPayment: boolean;
    registrationDeadline?: string;
    idResponsibleStaff?: number;
    observations?: string;
}

export interface RegisterStudentRequest {
    idEvent: number;
    idStudent: number;
    notes?: string;
    idRegisteredByStaff?: number;
}

@Injectable({ providedIn: 'root' })
export class EventsService {
    readonly DEMO_MODE = true;
    private readonly DELAY_MS = 350;

    private _events = signal<EventMock[]>([...MOCK_EVENTS]);
    private _registrations = signal<EventRegistrationMock[]>([...MOCK_EVENT_REGISTRATIONS]);
    private nextEventId = 100;
    private nextRegId = 100;

    // ── Tipos de evento ───────────────────────────────────────────────────────

    getEventTypes(): Observable<EventTypeMock[]> {
        return of(MOCK_EVENT_TYPES.filter((t) => t.isActive)).pipe(delay(this.DELAY_MS));
    }

    // ── Eventos ───────────────────────────────────────────────────────────────

    getEvents(filters?: EventFilter): Observable<EventMock[]> {
        let result = this._events().filter((e) => e.isActive);

        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((e) => e.name.toLowerCase().includes(q) || (e.eventTypeName ?? '').toLowerCase().includes(q) || (e.location ?? '').toLowerCase().includes(q));
        }
        if (filters?.status) result = result.filter((e) => e.status === filters.status);
        if (filters?.idEventType) result = result.filter((e) => e.idEventType === filters.idEventType);
        if (filters?.scope) result = result.filter((e) => e.scope === filters.scope);
        if (filters?.dateFrom) result = result.filter((e) => e.eventDate >= filters.dateFrom!);
        if (filters?.dateTo) result = result.filter((e) => e.eventDate <= filters.dateTo!);

        // Enriquecer con tipo (color/icon) y conteo de inscripciones reales
        result = result.map((e) => ({
            ...e,
            registrationsCount: this._registrations().filter((r) => r.idEvent === e.idEvent && r.isActive).length
        }));

        return of([...result].sort((a, b) => a.eventDate.localeCompare(b.eventDate))).pipe(delay(this.DELAY_MS));
    }

    getEventById(id: number): Observable<EventMock | undefined> {
        const event = this._events().find((e) => e.idEvent === id);
        if (!event) return of(undefined);
        return of({
            ...event,
            registrationsCount: this._registrations().filter((r) => r.idEvent === id && r.isActive).length
        }).pipe(delay(this.DELAY_MS));
    }

    createEvent(req: CreateEventRequest): Observable<EventMock> {
        const type = MOCK_EVENT_TYPES.find((t) => t.idEventType === req.idEventType);
        const newEvent: EventMock = {
            idEvent: this.nextEventId++,
            idCompany: 1,
            idBranch: 1,
            branchName: 'Sede Central',
            idEventType: req.idEventType,
            eventTypeName: type?.name ?? 'Otro',
            idSchoolYear: req.idSchoolYear,
            schoolYearName: 'Año Lectivo 2025',
            name: req.name,
            description: req.description,
            eventDate: req.eventDate,
            eventTime: req.eventTime,
            endDate: req.endDate,
            endTime: req.endTime,
            location: req.location,
            scope: req.scope,
            maxParticipants: req.maxParticipants,
            requiresPayment: req.requiresPayment,
            registrationDeadline: req.registrationDeadline,
            idResponsibleStaff: req.idResponsibleStaff,
            observations: req.observations,
            status: 'PLANNED',
            isActive: true,
            registrationsCount: 0
        };
        this._events.update((list) => [...list, newEvent]);
        return of(newEvent).pipe(delay(600));
    }

    updateStatus(idEvent: number, status: string): Observable<EventMock> {
        this._events.update((list) => list.map((e) => (e.idEvent === idEvent ? { ...e, status } : e)));
        const updated = this._events().find((e) => e.idEvent === idEvent)!;
        return of(updated).pipe(delay(400));
    }

    // ── Inscripciones ─────────────────────────────────────────────────────────

    getRegistrationsByEvent(idEvent: number): Observable<EventRegistrationMock[]> {
        const result = this._registrations().filter((r) => r.idEvent === idEvent && r.isActive);
        return of([...result].sort((a, b) => (a.studentName ?? '').localeCompare(b.studentName ?? ''))).pipe(delay(this.DELAY_MS));
    }

    registerStudent(req: RegisterStudentRequest): Observable<EventRegistrationMock> {
        // Verificar si ya está inscripto
        const existing = this._registrations().find((r) => r.idEvent === req.idEvent && r.idStudent === req.idStudent && r.isActive);
        if (existing) return of(existing).pipe(delay(200));

        const student = MOCK_STUDENTS.find((s) => s.idStudent === req.idStudent);
        const event = this._events().find((e) => e.idEvent === req.idEvent);
        const today = new Date().toISOString().split('T')[0];

        const newReg: EventRegistrationMock = {
            idEventRegistration: this.nextRegId++,
            idEvent: req.idEvent,
            eventName: event?.name,
            idStudent: req.idStudent,
            studentName: student?.fullName ?? 'Desconocido',
            gradeName: student?.gradeName,
            sectionName: student?.sectionName,
            registrationDate: today,
            status: 'REGISTERED',
            notes: req.notes,
            idRegisteredByStaff: req.idRegisteredByStaff,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        this._registrations.update((list) => [...list, newReg]);
        return of(newReg).pipe(delay(600));
    }

    cancelRegistration(idEventRegistration: number): Observable<void> {
        this._registrations.update((list) => list.map((r) => (r.idEventRegistration === idEventRegistration ? { ...r, status: 'CANCELLED', isActive: false } : r)));
        return of(void 0).pipe(delay(400));
    }

    // ── Alumnos disponibles para inscribir ────────────────────────────────────

    getAvailableStudents(idEvent: number): Observable<StudentMock[]> {
        const registeredIds = new Set(
            this._registrations()
                .filter((r) => r.idEvent === idEvent && r.isActive)
                .map((r) => r.idStudent)
        );
        const available = MOCK_STUDENTS.filter((s) => s.isActive && !registeredIds.has(s.idStudent));
        return of(available).pipe(delay(this.DELAY_MS));
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    getEventStats(): Observable<{
        totalEvents: number;
        planned: number;
        active: number;
        completed: number;
        cancelled: number;
        totalRegistrations: number;
        upcomingThisMonth: number;
    }> {
        const events = this._events().filter((e) => e.isActive);
        const today = new Date();
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

        return of({
            totalEvents: events.length,
            planned: events.filter((e) => e.status === 'PLANNED').length,
            active: events.filter((e) => e.status === 'ACTIVE').length,
            completed: events.filter((e) => e.status === 'COMPLETED').length,
            cancelled: events.filter((e) => e.status === 'CANCELLED').length,
            totalRegistrations: this._registrations().filter((r) => r.isActive).length,
            upcomingThisMonth: events.filter((e) => e.eventDate.startsWith(monthStr) && e.status !== 'CANCELLED').length
        }).pipe(delay(this.DELAY_MS));
    }

    // ── Eventos por mes (para calendario) ────────────────────────────────────

    getEventsByMonth(year: number, month: number): Observable<EventMock[]> {
        const pad = String(month).padStart(2, '0');
        const prefix = `${year}-${pad}`;
        const result = this._events().filter((e) => e.isActive && e.eventDate.startsWith(prefix));
        return of(result).pipe(delay(this.DELAY_MS));
    }
}
