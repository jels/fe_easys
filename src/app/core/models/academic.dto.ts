export interface GradeDTO {
    idGrade?: number;
    idCompany: number;
    companyName?: string;
    name: string;
    level?: string; // INICIAL, EEB, MEDIA
    gradeOrder: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface BranchDTO {
    idBranch?: number;
    idCompany: number;
    name: string;
    code: string;
    address?: string;
    phone?: string;
    isMain?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SectionDTO {
    idSection?: number;
    idCompany: number;
    idGrade: number;
    gradeName?: string;
    idSchoolYear: number;
    schoolYearName?: string;
    name: string;
    maxCapacity?: number;
    idHomeroomTeacher?: number;
    homeroomTeacherName?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
