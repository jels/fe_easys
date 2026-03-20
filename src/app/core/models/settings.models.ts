// src/app/core/models/settings.models.ts
// Mapean los DTOs del SettingsController backend

export interface CompanyResponse {
    idCompany: number;
    name: string;
    legalName: string;
    ruc: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    isActive: boolean;
}

export interface BranchResponse {
    idBranch: number;
    idCompany: number;
    companyName: string;
    name: string;
    code: string;
    address?: string | null;
    phone?: string | null;
    isMain: boolean;
    isActive: boolean;
}

export interface SchoolYearResponse {
    idSchoolYear: number;
    idCompany: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
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

export interface SystemParamResponse {
    idParam: number;
    idCompany: number;
    paramKey: string;
    paramValue: string;
    paramType: string;
    label: string;
    description?: string | null;
    category?: string | null;
    options?: string | null;
    isEditable: boolean;
    isActive: boolean;
}

export interface SettingsStatsResponse {
    totalBranches: number;
    activeYear: string;
    activePeriod: string;
    totalParams: number;
    demoMode: boolean;
}
