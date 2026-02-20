// src/app/shared/data/operations.mock.ts

export interface StudentAccessLogMock {
    idStudentAccessLog: number;
    idStudent: number;
    studentName?: string;
    gradeName?: string;
    sectionName?: string;
    accessDate: string;
    entryTime?: string;
    exitTime?: string;
    isLate: boolean;
    isAbsent: boolean;
    absenceJustified: boolean;
    absenceReason?: string;
    idRegisteredByStaff?: number;
    registeredByName?: string;
    observations?: string;
    isActive: boolean;
}

export interface StaffAccessLogMock {
    idStaffAccessLog: number;
    idStaff: number;
    staffName?: string;
    staffType?: string;
    accessDate: string;
    entryTime?: string;
    exitTime?: string;
    isLate: boolean;
    observations?: string;
    isActive: boolean;
}

export interface InfractionTypeMock {
    idInfractionType: number;
    idCompany: number;
    name: string;
    severity: string; // LOW | MEDIUM | HIGH | CRITICAL
    description?: string;
    defaultSanction?: string;
    isActive: boolean;
}

export interface StudentInfractionMock {
    idStudentInfraction: number;
    idStudent: number;
    studentName?: string;
    idInfractionType: number;
    infractionTypeName?: string;
    severity?: string;
    idReportedByStaff?: number;
    reportedByName?: string;
    incidentDate: string;
    incidentTime?: string;
    description: string;
    sanctionApplied?: string;
    parentNotified: boolean;
    parentNotifiedAt?: string;
    observations?: string;
    isActive: boolean;
    createdAt: string;
}

export interface EarlyDepartureMock {
    idEarlyDeparture: number;
    idStudent: number;
    studentName?: string;
    gradeName?: string;
    departureDatetime: string;
    reason: string;
    idAuthorizedByStaff?: number;
    authorizedByName?: string;
    pickedUpByName?: string;
    pickedUpByDocument?: string;
    pickedUpByRelationship?: string;
    parentAuthorization: boolean;
    returnDatetime?: string;
    observations?: string;
    isActive: boolean;
    createdAt: string;
}

export interface GradeScoreMock {
    idGradeScore: number;
    idStudentEnrollment: number;
    studentName?: string;
    idSubject: number;
    subjectName?: string;
    subjectCode?: string;
    idSchoolPeriod: number;
    schoolPeriodName?: string;
    score: number;
    maxScore: number;
    idTeacher?: number;
    teacherName?: string;
    observations?: string;
    gradedAt?: string;
    isActive: boolean;
}

export interface EventMock {
    idEvent: number;
    idCompany: number;
    idBranch?: number;
    branchName?: string;
    idEventType: number;
    eventTypeName?: string;
    idSchoolYear: number;
    schoolYearName?: string;
    name: string;
    description?: string;
    eventDate: string;
    eventTime?: string;
    endDate?: string;
    endTime?: string;
    location?: string;
    scope: string; // GENERAL | GRADE | SECTION
    maxParticipants?: number;
    requiresPayment: boolean;
    registrationDeadline?: string;
    idResponsibleStaff?: number;
    responsibleStaffName?: string;
    status: string; // PLANNED | ACTIVE | COMPLETED | CANCELLED
    observations?: string;
    isActive: boolean;
    registrationsCount?: number;
}

// ── Event Type ────────────────────────────────────────────────────────────────
export interface EventTypeMock {
    idEventType: number;
    idCompany: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive: boolean;
}

// ── Infraction Types ──────────────────────────────────────────────────────────
export const MOCK_INFRACTION_TYPES: InfractionTypeMock[] = [
    { idInfractionType: 1, idCompany: 1, name: 'Llegada tardía', severity: 'LOW', description: 'Llegada después del horario establecido', defaultSanction: 'Advertencia verbal', isActive: true },
    { idInfractionType: 2, idCompany: 1, name: 'Falta de tarea', severity: 'LOW', description: 'No entrega de tarea asignada', defaultSanction: 'Tarea doble', isActive: true },
    { idInfractionType: 3, idCompany: 1, name: 'Mal comportamiento', severity: 'MEDIUM', description: 'Conducta inapropiada en clase', defaultSanction: 'Llamado de atención por escrito', isActive: true },
    { idInfractionType: 4, idCompany: 1, name: 'Uso de celular en clase', severity: 'MEDIUM', description: 'Uso de dispositivo móvil no autorizado', defaultSanction: 'Retención del dispositivo', isActive: true },
    { idInfractionType: 5, idCompany: 1, name: 'Falta de uniforme', severity: 'LOW', description: 'Asistencia sin uniforme reglamentario', defaultSanction: 'Notificación a padres', isActive: true },
    { idInfractionType: 6, idCompany: 1, name: 'Agresión verbal', severity: 'HIGH', description: 'Insultos o lenguaje inapropiado hacia compañeros o docentes', defaultSanction: 'Citación a padres', isActive: true },
    { idInfractionType: 7, idCompany: 1, name: 'Daño a la propiedad', severity: 'HIGH', description: 'Destrucción o daño a bienes del colegio', defaultSanction: 'Citación a padres y reposición del daño', isActive: true },
    { idInfractionType: 8, idCompany: 1, name: 'Agresión física', severity: 'CRITICAL', description: 'Violencia física hacia cualquier persona', defaultSanction: 'Suspensión inmediata', isActive: true }
];

// ── Student Access Logs ───────────────────────────────────────────────────────
export const MOCK_STUDENT_ACCESS_LOGS: StudentAccessLogMock[] = [
    {
        idStudentAccessLog: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        gradeName: '8° Grado',
        sectionName: 'A',
        accessDate: '2025-02-19',
        entryTime: '2025-02-19T07:15:00',
        exitTime: '2025-02-19T13:00:00',
        isLate: false,
        isAbsent: false,
        absenceJustified: false,
        idRegisteredByStaff: 8,
        registeredByName: 'Jorge Méndez Villalba',
        isActive: true
    },
    {
        idStudentAccessLog: 2,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        gradeName: '9° Grado',
        sectionName: 'A',
        accessDate: '2025-02-19',
        entryTime: '2025-02-19T07:32:00',
        exitTime: '2025-02-19T13:00:00',
        isLate: true,
        isAbsent: false,
        absenceJustified: false,
        idRegisteredByStaff: 8,
        registeredByName: 'Jorge Méndez Villalba',
        observations: 'Llegó 17 min tarde',
        isActive: true
    },
    {
        idStudentAccessLog: 3,
        idStudent: 3,
        studentName: 'Valentina Ramírez Silva',
        gradeName: '7° Grado',
        sectionName: 'A',
        accessDate: '2025-02-19',
        entryTime: '2025-02-19T07:10:00',
        exitTime: '2025-02-19T13:00:00',
        isLate: false,
        isAbsent: false,
        absenceJustified: false,
        idRegisteredByStaff: 8,
        registeredByName: 'Jorge Méndez Villalba',
        isActive: true
    },
    {
        idStudentAccessLog: 4,
        idStudent: 5,
        studentName: 'Isabella Díaz Morales',
        gradeName: '8° Grado',
        sectionName: 'B',
        accessDate: '2025-02-19',
        entryTime: undefined,
        exitTime: undefined,
        isLate: false,
        isAbsent: true,
        absenceJustified: false,
        isActive: true
    },
    {
        idStudentAccessLog: 5,
        idStudent: 4,
        studentName: 'Mateo Fernández Torres',
        gradeName: '1° Curso',
        sectionName: 'A',
        accessDate: '2025-02-19',
        entryTime: '2025-02-19T07:05:00',
        exitTime: '2025-02-19T13:00:00',
        isLate: false,
        isAbsent: false,
        absenceJustified: false,
        idRegisteredByStaff: 8,
        registeredByName: 'Jorge Méndez Villalba',
        isActive: true
    },
    {
        idStudentAccessLog: 6,
        idStudent: 6,
        studentName: 'Santiago Ortiz Cabrera',
        gradeName: '9° Grado',
        sectionName: 'A',
        accessDate: '2025-02-19',
        entryTime: '2025-02-19T07:20:00',
        exitTime: '2025-02-19T13:00:00',
        isLate: false,
        isAbsent: false,
        absenceJustified: false,
        idRegisteredByStaff: 8,
        registeredByName: 'Jorge Méndez Villalba',
        isActive: true
    },
    {
        idStudentAccessLog: 7,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        gradeName: '8° Grado',
        sectionName: 'A',
        accessDate: '2025-02-18',
        entryTime: '2025-02-18T07:12:00',
        exitTime: '2025-02-18T13:00:00',
        isLate: false,
        isAbsent: false,
        absenceJustified: false,
        idRegisteredByStaff: 8,
        registeredByName: 'Jorge Méndez Villalba',
        isActive: true
    },
    {
        idStudentAccessLog: 8,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        gradeName: '9° Grado',
        sectionName: 'A',
        accessDate: '2025-02-18',
        entryTime: undefined,
        exitTime: undefined,
        isLate: false,
        isAbsent: true,
        absenceJustified: true,
        absenceReason: 'Cita médica',
        isActive: true
    }
];

// ── Staff Access Logs ─────────────────────────────────────────────────────────
export const MOCK_STAFF_ACCESS_LOGS: StaffAccessLogMock[] = [
    { idStaffAccessLog: 1, idStaff: 1, staffName: 'Roberto Sánchez Duarte', staffType: 'DIRECTOR', accessDate: '2025-02-19', entryTime: '2025-02-19T06:45:00', exitTime: '2025-02-19T14:00:00', isLate: false, isActive: true },
    { idStaffAccessLog: 2, idStaff: 2, staffName: 'Elena Figueredo Páez', staffType: 'ADMINISTRATIVE', accessDate: '2025-02-19', entryTime: '2025-02-19T07:00:00', exitTime: '2025-02-19T14:00:00', isLate: false, isActive: true },
    { idStaffAccessLog: 3, idStaff: 3, staffName: 'Carlos Benítez Coronel', staffType: 'TEACHER', accessDate: '2025-02-19', entryTime: '2025-02-19T07:05:00', exitTime: '2025-02-19T13:00:00', isLate: false, isActive: true },
    {
        idStaffAccessLog: 4,
        idStaff: 4,
        staffName: 'Laura Valdez Ocampos',
        staffType: 'TEACHER',
        accessDate: '2025-02-19',
        entryTime: '2025-02-19T07:35:00',
        exitTime: '2025-02-19T13:00:00',
        isLate: true,
        observations: 'Llegó 35 min tarde',
        isActive: true
    },
    { idStaffAccessLog: 5, idStaff: 5, staffName: 'Ana Giménez Rojas', staffType: 'TEACHER', accessDate: '2025-02-19', entryTime: '2025-02-19T07:00:00', exitTime: undefined, isLate: false, isActive: true }
];

// ── Student Infractions ───────────────────────────────────────────────────────
export const MOCK_STUDENT_INFRACTIONS: StudentInfractionMock[] = [
    {
        idStudentInfraction: 1,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        idInfractionType: 1,
        infractionTypeName: 'Llegada tardía',
        severity: 'LOW',
        idReportedByStaff: 3,
        reportedByName: 'Carlos Benítez Coronel',
        incidentDate: '2025-02-19',
        incidentTime: '07:32',
        description: 'Llegó 17 minutos tarde a la clase de matemáticas.',
        sanctionApplied: 'Advertencia verbal',
        parentNotified: false,
        isActive: true,
        createdAt: '2025-02-19T07:35:00'
    },
    {
        idStudentInfraction: 2,
        idStudent: 6,
        studentName: 'Santiago Ortiz Cabrera',
        idInfractionType: 4,
        infractionTypeName: 'Uso de celular',
        severity: 'MEDIUM',
        idReportedByStaff: 4,
        reportedByName: 'Laura Valdez Ocampos',
        incidentDate: '2025-02-18',
        incidentTime: '09:15',
        description: 'Usó el celular durante la clase de lengua sin autorización.',
        sanctionApplied: 'Retención del dispositivo por 1 día',
        parentNotified: true,
        parentNotifiedAt: '2025-02-18T12:00:00',
        isActive: true,
        createdAt: '2025-02-18T09:20:00'
    },
    {
        idStudentInfraction: 3,
        idStudent: 10,
        studentName: 'Nicolás Acosta Rivarola',
        idInfractionType: 2,
        infractionTypeName: 'Falta de tarea',
        severity: 'LOW',
        idReportedByStaff: 3,
        reportedByName: 'Carlos Benítez Coronel',
        incidentDate: '2025-02-17',
        incidentTime: '08:00',
        description: 'No presentó la tarea de matemáticas asignada.',
        sanctionApplied: 'Tarea doble para el día siguiente',
        parentNotified: false,
        isActive: true,
        createdAt: '2025-02-17T08:05:00'
    },
    {
        idStudentInfraction: 4,
        idStudent: 14,
        studentName: 'Franco Britez Zárate',
        idInfractionType: 3,
        infractionTypeName: 'Mal comportamiento',
        severity: 'MEDIUM',
        idReportedByStaff: 5,
        reportedByName: 'Ana Giménez Rojas',
        incidentDate: '2025-02-14',
        incidentTime: '10:30',
        description: 'Interrumpió repetidamente la clase con comentarios inapropiados.',
        sanctionApplied: 'Llamado de atención por escrito',
        parentNotified: true,
        parentNotifiedAt: '2025-02-14T13:00:00',
        isActive: true,
        createdAt: '2025-02-14T11:00:00'
    }
];

// ── Early Departures ──────────────────────────────────────────────────────────
export const MOCK_EARLY_DEPARTURES: EarlyDepartureMock[] = [
    {
        idEarlyDeparture: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        gradeName: '8° Grado',
        departureDatetime: '2025-02-18T10:00:00',
        reason: 'Cita médica con pediatra',
        idAuthorizedByStaff: 2,
        authorizedByName: 'Elena Figueredo Páez',
        pickedUpByName: 'Patricia López de Martínez',
        pickedUpByDocument: '4001122',
        pickedUpByRelationship: 'Madre',
        parentAuthorization: true,
        returnDatetime: undefined,
        isActive: true,
        createdAt: '2025-02-18T09:45:00'
    },
    {
        idEarlyDeparture: 2,
        idStudent: 9,
        studentName: 'Luciana Vega Estigarribia',
        gradeName: '8° Grado',
        departureDatetime: '2025-02-17T11:30:00',
        reason: 'Emergencia familiar',
        idAuthorizedByStaff: 1,
        authorizedByName: 'Roberto Sánchez Duarte',
        pickedUpByName: 'Andrea Estigarribia',
        pickedUpByDocument: '4567890',
        pickedUpByRelationship: 'Madre',
        parentAuthorization: true,
        returnDatetime: undefined,
        isActive: true,
        createdAt: '2025-02-17T11:00:00'
    }
];

// ── Grade Scores ──────────────────────────────────────────────────────────────
export const MOCK_GRADE_SCORES: GradeScoreMock[] = [
    {
        idGradeScore: 1,
        idStudentEnrollment: 1,
        studentName: 'Sofía Martínez López',
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        score: 9.5,
        maxScore: 10,
        idTeacher: 3,
        teacherName: 'Carlos Benítez Coronel',
        gradedAt: '2025-03-30',
        isActive: true
    },
    {
        idGradeScore: 2,
        idStudentEnrollment: 1,
        studentName: 'Sofía Martínez López',
        idSubject: 2,
        subjectName: 'Lengua',
        subjectCode: 'LCL',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        score: 8.7,
        maxScore: 10,
        idTeacher: 4,
        teacherName: 'Laura Valdez Ocampos',
        gradedAt: '2025-03-28',
        isActive: true
    },
    {
        idGradeScore: 3,
        idStudentEnrollment: 1,
        studentName: 'Sofía Martínez López',
        idSubject: 3,
        subjectName: 'Cs. Naturales',
        subjectCode: 'CNA',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        score: 9.8,
        maxScore: 10,
        idTeacher: 5,
        teacherName: 'Ana Giménez Rojas',
        gradedAt: '2025-03-29',
        isActive: true
    },
    {
        idGradeScore: 4,
        idStudentEnrollment: 1,
        studentName: 'Sofía Martínez López',
        idSubject: 6,
        subjectName: 'Inglés',
        subjectCode: 'ING',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        score: 9.2,
        maxScore: 10,
        idTeacher: 7,
        teacherName: 'María Cabrera Duarte',
        gradedAt: '2025-03-27',
        isActive: true
    },
    {
        idGradeScore: 5,
        idStudentEnrollment: 2,
        studentName: 'Lucas González Benítez',
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        score: 7.5,
        maxScore: 10,
        idTeacher: 3,
        teacherName: 'Carlos Benítez Coronel',
        gradedAt: '2025-03-30',
        isActive: true
    },
    {
        idGradeScore: 6,
        idStudentEnrollment: 2,
        studentName: 'Lucas González Benítez',
        idSubject: 2,
        subjectName: 'Lengua',
        subjectCode: 'LCL',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        score: 8.0,
        maxScore: 10,
        idTeacher: 4,
        teacherName: 'Laura Valdez Ocampos',
        gradedAt: '2025-03-28',
        isActive: true
    },
    {
        idGradeScore: 7,
        idStudentEnrollment: 3,
        studentName: 'Valentina Ramírez Silva',
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        score: 10.0,
        maxScore: 10,
        idTeacher: 3,
        teacherName: 'Carlos Benítez Coronel',
        gradedAt: '2025-03-30',
        isActive: true
    },
    {
        idGradeScore: 8,
        idStudentEnrollment: 3,
        studentName: 'Valentina Ramírez Silva',
        idSubject: 3,
        subjectName: 'Cs. Naturales',
        subjectCode: 'CNA',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        score: 9.0,
        maxScore: 10,
        idTeacher: 5,
        teacherName: 'Ana Giménez Rojas',
        gradedAt: '2025-03-29',
        isActive: true
    }
];

// ── Events ────────────────────────────────────────────────────────────────────
export const MOCK_EVENTS: EventMock[] = [
    {
        idEvent: 1,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        idEventType: 1,
        eventTypeName: 'Acto Escolar',
        idSchoolYear: 1,
        schoolYearName: 'Año Lectivo 2025',
        name: 'Acto de Inicio del Año Lectivo 2025',
        description: 'Ceremonia de apertura del ciclo escolar con presencia de autoridades, docentes, padres y alumnos.',
        eventDate: '2025-02-28',
        eventTime: '08:00',
        endDate: '2025-02-28',
        endTime: '10:30',
        location: 'Patio Central',
        scope: 'GENERAL',
        maxParticipants: 500,
        requiresPayment: false,
        registrationDeadline: undefined,
        idResponsibleStaff: 1,
        responsibleStaffName: 'Roberto Sánchez Duarte',
        status: 'PLANNED',
        isActive: true,
        registrationsCount: 0
    },
    {
        idEvent: 2,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        idEventType: 2,
        eventTypeName: 'Evaluación',
        idSchoolYear: 1,
        schoolYearName: 'Año Lectivo 2025',
        name: 'Evaluaciones del 1er Bimestre',
        description: 'Evaluaciones escritas de todas las materias del primer bimestre.',
        eventDate: '2025-03-24',
        eventTime: '07:15',
        endDate: '2025-03-28',
        endTime: '13:00',
        location: 'Aulas',
        scope: 'GENERAL',
        requiresPayment: false,
        idResponsibleStaff: 1,
        responsibleStaffName: 'Roberto Sánchez Duarte',
        status: 'PLANNED',
        isActive: true,
        registrationsCount: 0
    },
    {
        idEvent: 3,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        idEventType: 3,
        eventTypeName: 'Excursión',
        idSchoolYear: 1,
        schoolYearName: 'Año Lectivo 2025',
        name: 'Visita al Jardín Botánico',
        description: 'Excursión educativa para los grados de EEB al Jardín Botánico de Asunción.',
        eventDate: '2025-03-14',
        eventTime: '07:00',
        endDate: '2025-03-14',
        endTime: '14:00',
        location: 'Jardín Botánico, Asunción',
        scope: 'GRADE',
        maxParticipants: 120,
        requiresPayment: true,
        registrationDeadline: '2025-03-07',
        idResponsibleStaff: 5,
        responsibleStaffName: 'Ana Giménez Rojas',
        status: 'PLANNED',
        isActive: true,
        registrationsCount: 45
    },
    {
        idEvent: 4,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        idEventType: 4,
        eventTypeName: 'Reunión de Padres',
        idSchoolYear: 1,
        schoolYearName: 'Año Lectivo 2025',
        name: 'Reunión de Padres - Inicio de Año',
        description: 'Reunión informativa para padres y tutores sobre el año lectivo 2025.',
        eventDate: '2025-02-21',
        eventTime: '18:00',
        endDate: '2025-02-21',
        endTime: '20:00',
        location: 'Salón de Actos',
        scope: 'GENERAL',
        requiresPayment: false,
        idResponsibleStaff: 1,
        responsibleStaffName: 'Roberto Sánchez Duarte',
        status: 'PLANNED',
        isActive: true,
        registrationsCount: 0
    }
];

export const MOCK_EVENT_TYPES: EventTypeMock[] = [
    { idEventType: 1, idCompany: 1, name: 'Acto Escolar', description: 'Ceremonias y actos institucionales', color: '#6366f1', icon: 'pi-star', isActive: true },
    { idEventType: 2, idCompany: 1, name: 'Evaluación', description: 'Instancias de evaluación formal', color: '#f59e0b', icon: 'pi-pencil', isActive: true },
    { idEventType: 3, idCompany: 1, name: 'Excursión', description: 'Salidas y visitas educativas', color: '#10b981', icon: 'pi-map-marker', isActive: true },
    { idEventType: 4, idCompany: 1, name: 'Reunión de Padres', description: 'Encuentros con padres y tutores', color: '#3b82f6', icon: 'pi-users', isActive: true },
    { idEventType: 5, idCompany: 1, name: 'Taller', description: 'Talleres y actividades extracurriculares', color: '#8b5cf6', icon: 'pi-bolt', isActive: true },
    { idEventType: 6, idCompany: 1, name: 'Deportivo', description: 'Competencias y actividades deportivas', color: '#ef4444', icon: 'pi-verified', isActive: true },
    { idEventType: 7, idCompany: 1, name: 'Cultural', description: 'Eventos artísticos y culturales', color: '#ec4899', icon: 'pi-palette', isActive: true },
    { idEventType: 8, idCompany: 1, name: 'Administrativo', description: 'Procesos administrativos', color: '#64748b', icon: 'pi-cog', isActive: true }
];

// ── Event Registration ────────────────────────────────────────────────────────
export interface EventRegistrationMock {
    idEventRegistration: number;
    idEvent: number;
    eventName?: string;
    idStudent: number;
    studentName?: string;
    gradeName?: string;
    sectionName?: string;
    registrationDate: string;
    status: string; // REGISTERED | CONFIRMED | CANCELLED | ATTENDED
    notes?: string;
    idRegisteredByStaff?: number;
    registeredByName?: string;
    isActive: boolean;
    createdAt: string;
}

export const MOCK_EVENT_REGISTRATIONS: EventRegistrationMock[] = [
    // Evento 3 — Visita al Jardín Botánico
    {
        idEventRegistration: 1,
        idEvent: 3,
        eventName: 'Visita al Jardín Botánico',
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        gradeName: '7° Grado',
        sectionName: 'A',
        registrationDate: '2025-03-01',
        status: 'CONFIRMED',
        idRegisteredByStaff: 2,
        registeredByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-03-01T10:00:00'
    },
    {
        idEventRegistration: 2,
        idEvent: 3,
        eventName: 'Visita al Jardín Botánico',
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        gradeName: '7° Grado',
        sectionName: 'A',
        registrationDate: '2025-03-01',
        status: 'CONFIRMED',
        idRegisteredByStaff: 2,
        registeredByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-03-01T10:05:00'
    },
    {
        idEventRegistration: 3,
        idEvent: 3,
        eventName: 'Visita al Jardín Botánico',
        idStudent: 3,
        studentName: 'Valentina Ramírez Silva',
        gradeName: '7° Grado',
        sectionName: 'A',
        registrationDate: '2025-03-02',
        status: 'REGISTERED',
        idRegisteredByStaff: 2,
        registeredByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-03-02T09:00:00'
    },
    {
        idEventRegistration: 4,
        idEvent: 3,
        eventName: 'Visita al Jardín Botánico',
        idStudent: 4,
        studentName: 'Mateo Fernández Torres',
        gradeName: '8° Grado',
        sectionName: 'A',
        registrationDate: '2025-03-02',
        status: 'REGISTERED',
        idRegisteredByStaff: 2,
        registeredByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-03-02T09:10:00'
    },
    {
        idEventRegistration: 5,
        idEvent: 3,
        eventName: 'Visita al Jardín Botánico',
        idStudent: 5,
        studentName: 'Isabella Díaz Morales',
        gradeName: '8° Grado',
        sectionName: 'B',
        registrationDate: '2025-03-03',
        status: 'CANCELLED',
        idRegisteredByStaff: 2,
        registeredByName: 'Elena Figueredo Páez',
        notes: 'Canceló por viaje familiar',
        isActive: false,
        createdAt: '2025-03-03T11:00:00'
    },
    // Evento 1 — Acto de Inicio
    {
        idEventRegistration: 6,
        idEvent: 1,
        eventName: 'Acto de Inicio del Año Lectivo 2025',
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        gradeName: '7° Grado',
        sectionName: 'A',
        registrationDate: '2025-02-20',
        status: 'CONFIRMED',
        idRegisteredByStaff: 2,
        registeredByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-02-20T08:00:00'
    },
    {
        idEventRegistration: 7,
        idEvent: 1,
        eventName: 'Acto de Inicio del Año Lectivo 2025',
        idStudent: 6,
        studentName: 'Santiago Ortiz Cabrera',
        gradeName: '9° Grado',
        sectionName: 'A',
        registrationDate: '2025-02-20',
        status: 'REGISTERED',
        idRegisteredByStaff: 2,
        registeredByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-02-20T08:05:00'
    }
];
