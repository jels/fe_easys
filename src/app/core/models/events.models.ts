// src/app/core/models/events.models.ts

export interface EventTypeResponse {
    idEventType: number;
    idCompany: number;
    name: string;
    code: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    isActive: boolean;
}

export interface EventResponse {
    idEvent: number;
    idCompany: number;
    idBranch?: number | null;
    branchName?: string | null;
    idEventType: number;
    eventTypeName?: string | null;
    eventTypeColor?: string | null;
    eventTypeIcon?: string | null;
    idSchoolYear: number;
    schoolYearName?: string | null;
    name: string;
    description?: string | null;
    eventDate: string;
    eventTime?: string | null;
    endDate?: string | null;
    endTime?: string | null;
    location?: string | null;
    scope: string; // ALL | GRADE | SECTION
    maxParticipants?: number | null;
    requiresPayment: boolean;
    registrationDeadline?: string | null;
    idResponsibleStaff?: number | null;
    responsibleStaffName?: string | null;
    status: string; // PLANNED | PUBLISHED | IN_PROGRESS | COMPLETED | CANCELLED
    observations?: string | null;
    isActive: boolean;
    registrationsCount?: number;
}

export interface EventRegistrationResponse {
    idEventRegistration: number;
    idEvent: number;
    eventName?: string | null;
    idStudent: number;
    studentName?: string | null;
    gradeName?: string | null;
    sectionName?: string | null;
    registrationDate?: string | null;
    idRegisteredByStaff?: number | null;
    registeredByName?: string | null;
    idAuthorizedByParent?: number | null;
    status: string;
    paymentRequired: boolean;
    paymentStatus?: string | null;
    amountToPay?: number | null;
    amountPaid?: number | null;
    attended: boolean;
    attendanceTime?: string | null;
    observations?: string | null;
    isActive: boolean;
}

export interface EventStatsResponse {
    totalEvents: number;
    planned: number;
    active: number;
    completed: number;
    cancelled: number;
    totalRegistrations: number;
    upcomingThisMonth: number;
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreateEventTypeRequest {
    idCompany: number;
    name: string;
    code: string;
    description?: string;
    icon?: string;
    color?: string;
}

export interface CreateEventRequest {
    idCompany: number;
    idBranch?: number;
    idEventType: number;
    idSchoolYear: number;
    name: string;
    description?: string;
    eventDate: string;
    eventTime?: string;
    endDate?: string;
    endTime?: string;
    location?: string;
    scope?: string;
    maxParticipants?: number;
    requiresPayment?: boolean;
    registrationDeadline?: string;
    idResponsibleStaff?: number;
    observations?: string;
}

export interface UpdateEventRequest {
    name?: string;
    description?: string;
    eventDate?: string;
    eventTime?: string;
    endDate?: string;
    endTime?: string;
    location?: string;
    scope?: string;
    maxParticipants?: number;
    requiresPayment?: boolean;
    registrationDeadline?: string;
    idResponsibleStaff?: number;
    status?: string;
    observations?: string;
}

export interface RegisterStudentEventRequest {
    idEvent: number;
    idStudent: number;
    idRegisteredByStaff?: number;
    idAuthorizedByParent?: number;
    paymentRequired?: boolean;
    amountToPay?: number;
    notes?: string;
}
