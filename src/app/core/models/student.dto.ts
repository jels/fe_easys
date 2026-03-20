// src/app/core/models/student.models.ts
// Alineado con StudentResponse / PersonResponse del backend
// y compatible con los campos que usa el template del componente

import { ApiResponse } from './auth.models';

// ── Modelos backend ───────────────────────────────────────────────────────────

export interface PersonResponse {
    idPerson: number;
    idCompany: number;
    firstName: string;
    lastName: string;
    fullName: string; // firstName + " " + lastName — calculado por el mapper
    documentType: string;
    documentNumber: string;
    birthDate?: string | null;
    gender?: string | null;
    bloodType?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    mobilePhone?: string | null;
    email?: string | null;
    isActive: boolean;
}

export interface StudentResponse {
    idStudent: number;
    idCompany: number;
    idBranch?: number | null;
    branchName?: string | null;
    enrollmentNumber: string;
    enrollmentDate: string;
    status: string; // ACTIVE | INACTIVE | GRADUATED | TRANSFERRED | WITHDRAWN
    idCurrentGrade?: number | null;
    gradeName?: string | null;
    gradeLevel?: string | null;
    idCurrentSection?: number | null;
    sectionName?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactRelationship?: string | null;
    medicalObservations?: string | null;
    isActive: boolean;
    person: PersonResponse;
    photoUrl?: string | null;

    // Helper de conveniencia — idéntico a person.fullName
    // Se puede usar en templates como student.fullName igual que el mock
    get fullName(): string;
}

export interface StudentParentResponse {
    idStudentParent: number;
    idStudent: number;
    studentName: string;
    gradeName?: string | null; // desnormalizado desde el backend
    sectionName?: string | null; // desnormalizado desde el backend
    idParent: number;
    parentName: string;
    parentPhone?: string | null;
    parentEmail?: string | null;
    relationship: string;
    isPrimaryContact: boolean;
    isAuthorizedPickup: boolean;
    isActive: boolean;
}

export interface ParentResponse {
    idParent: number;
    idCompany: number;
    occupation?: string | null;
    workplace?: string | null;
    workPhone?: string | null;
    isFinancialResponsible: boolean;
    isActive: boolean;
    person: PersonResponse;
}

export interface StudentStatsResponse {
    total: number;
    active: number;
    inactive: number;
    byGrade: Record<string, number>;
    byStatus: Record<string, number>;
}

// ── Page response genérico ────────────────────────────────────────────────────

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreatePersonRequest {
    idCompany: number;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    birthDate?: string;
    gender?: string;
    bloodType?: string;
    address?: string;
    city?: string;
    phone?: string;
    mobilePhone?: string;
    email?: string;
}

export interface CreateStudentRequest {
    idCompany: number;
    idBranch?: number;
    idPerson?: number;
    personData?: CreatePersonRequest;
    enrollmentNumber?: string;
    enrollmentDate?: string;
    idCurrentGrade?: number;
    idCurrentSection?: number;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    medicalObservations?: string;
}

export interface UpdateStudentRequest {
    firstName?: string;
    lastName?: string;
    documentType?: string;
    documentNumber?: string;
    birthDate?: string;
    gender?: string;
    bloodType?: string;
    address?: string;
    city?: string;
    phone?: string;
    mobilePhone?: string;
    email?: string;
    idBranch?: number;
    idCurrentGrade?: number;
    idCurrentSection?: number;
    status?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    medicalObservations?: string;
}

export interface LinkStudentParentRequest {
    idStudent: number;
    idParent: number;
    relationship: string;
    isPrimaryContact?: boolean;
    isAuthorizedPickup?: boolean;
}

// ── Filtros ───────────────────────────────────────────────────────────────────

export interface StudentFilter {
    search?: string;
    status?: string;
    idGrade?: number;
    idSection?: number;
    idBranch?: number;
    page?: number; // 0-based (Spring Data)
    size?: number;
}

// ── Helper function ───────────────────────────────────────────────────────────
// Usar en el componente cuando el template espere student.fullName
// Ej: getFullName(student)  o  student.person.fullName directamente

export function getFullName(student: StudentResponse): string {
    return student.person?.fullName ?? `${student.person?.firstName ?? ''} ${student.person?.lastName ?? ''}`.trim();
}
