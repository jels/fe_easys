// src/app/core/models/academic.models.ts
// Mapean exactamente los DTOs response del AcademicController backend

// ── Responses del backend ─────────────────────────────────────────────────────

export interface SchoolYearResponse {
    idSchoolYear: number;
    idCompany: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    periods?: SchoolPeriodResponse[];
}

export interface SchoolPeriodResponse {
    idSchoolPeriod: number;
    idSchoolYear: number;
    schoolYearName?: string;
    name: string;
    periodNumber: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface GradeResponse {
    idGrade: number;
    idCompany: number;
    name: string;
    level: string; // INICIAL | EEB | MEDIA
    gradeOrder: number;
    isActive: boolean;
}

export interface SectionResponse {
    idSection: number;
    idCompany: number;
    idGrade: number;
    gradeName?: string;
    gradeLevel?: string;
    idSchoolYear: number;
    schoolYearName?: string;
    name: string;
    maxCapacity?: number;
    idHomeroomTeacher?: number;
    homeroomTeacherName?: string;
    isActive: boolean;
}

export interface SubjectResponse {
    idSubject: number;
    idCompany: number;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
}

export interface ClassScheduleResponse {
    idClassSchedule: number;
    idSection: number;
    sectionName?: string;
    gradeName?: string;
    idSubject: number;
    subjectName?: string;
    subjectCode?: string;
    idTeacher: number;
    teacherName?: string;
    dayOfWeek: number; // 1=Lunes … 5=Viernes
    dayName?: string;
    startTime: string; // HH:mm
    endTime: string;
    classroom?: string;
    isActive: boolean;
}

export interface GradeScoreResponse {
    idGradeScore: number;
    idStudentEnrollment: number;
    idStudent: number;
    studentName?: string;
    idSubject: number;
    subjectName?: string;
    subjectCode?: string;
    idSchoolPeriod: number;
    schoolPeriodName?: string;
    periodNumber: number;
    score: number;
    maxScore: number;
    idTeacher?: number;
    teacherName?: string;
    observations?: string;
    gradedAt?: string;
    isActive: boolean;
}

export interface AcademicStatsResponse {
    totalSections: number;
    totalStudents: number;
    totalSubjects: number;
    activePeriod: string;
    activeYear: string;
    scoresLoaded: number;
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreateGradeRequest {
    idCompany: number;
    name: string;
    level?: string;
    gradeOrder: number;
}

export interface CreateSectionRequest {
    idCompany: number;
    idGrade: number;
    idSchoolYear: number;
    name: string;
    maxCapacity?: number;
    idHomeroomTeacher?: number;
}

export interface CreateSubjectRequest {
    idCompany: number;
    name: string;
    code: string;
    description?: string;
}

export interface UpsertClassScheduleRequest {
    idClassSchedule?: number;
    idSection: number;
    idSubject: number;
    idTeacher: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classroom?: string;
}

export interface EnrollStudentRequest {
    idStudent: number;
    idSection: number;
    idSchoolYear: number;
    enrollmentDate?: string;
}

export interface UpsertGradeScoreRequest {
    idStudentEnrollment: number;
    idSubject: number;
    idSchoolPeriod: number;
    score: number;
    maxScore?: number;
    idTeacher?: number;
    observations?: string;
    gradedAt?: string;
}

// ── Filtros ───────────────────────────────────────────────────────────────────

export interface SectionFilter {
    idGrade?: number;
    idSchoolYear?: number;
}

export interface ScheduleFilter {
    idSection?: number;
    idTeacher?: number;
}
