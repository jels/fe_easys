import { PersonDTO, PersonRequest } from './person.dto';

export interface StudentDTO {
    idStudent?: number;
    idPerson: number;
    idCompany: number;
    idBranch?: number;
    branchName?: string;
    enrollmentNumber: string;
    enrollmentDate: string; // LocalDate → string ISO 'YYYY-MM-DD'
    status: string;
    idCurrentGrade?: number;
    gradeName?: string;
    gradeLevel?: string;
    idCurrentSection?: number;
    sectionName?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    medicalObservations?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    // Datos denormalizados de person (el backend suele devolverlos junto)
    person?: PersonDTO;
    // Nombre completo calculado
    fullName?: string;
}

export interface StudentRequest {
    idCompany: number;
    idBranch?: number;
    enrollmentNumber: string;
    enrollmentDate: string;
    status: string;
    idCurrentGrade?: number;
    idCurrentSection?: number;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    medicalObservations?: string;
    person: PersonRequest;
}

export interface StudentSummaryDTO {
    idStudent: number;
    fullName: string;
    enrollmentNumber: string;
    gradeName?: string;
    sectionName?: string;
    status: string;
    documentNumber: string;
    mobilePhone?: string;
    email?: string;
}
