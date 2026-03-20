// src/app/core/models/staff.models.ts

import { CreatePersonRequest, PersonResponse } from './student.dto';

export interface StaffResponse {
    idStaff: number;
    idCompany: number;
    idBranch?: number | null;
    branchName?: string | null;
    idUser?: number | null;
    employeeNumber: string;
    hireDate: string;
    staffType: string; // TEACHER | ADMINISTRATIVE | SUPPORT | DIRECTOR
    position?: string | null;
    department?: string | null;
    specialization?: string | null;
    salary?: number | null;
    status: string; // ACTIVE | INACTIVE | ON_LEAVE | TERMINATED
    terminationDate?: string | null;
    isActive: boolean;
    person: PersonResponse;
    photoUrl?: string | null;

    // Helpers de conveniencia
    get fullName(): string;
}

export interface StaffStatsResponse {
    total: number;
    teachers: number;
    administrative: number;
    onLeave: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
}

export interface CreateStaffRequest {
    idCompany: number;
    idBranch?: number;
    idPerson?: number;
    personData?: CreatePersonRequest;
    idUser?: number;
    employeeNumber?: string;
    hireDate: string;
    staffType: string;
    position?: string;
    department?: string;
    specialization?: string;
    salary?: number;
}

export interface UpdateStaffRequest {
    firstName?: string;
    lastName?: string;
    documentType?: string;
    documentNumber?: string;
    birthDate?: string;
    gender?: string;
    address?: string;
    city?: string;
    phone?: string;
    mobilePhone?: string;
    email?: string;
    idBranch?: number;
    idUser?: number;
    staffType?: string;
    position?: string;
    department?: string;
    specialization?: string;
    salary?: number;
    status?: string;
    terminationDate?: string;
}
