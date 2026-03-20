import { PersonDTO, PersonRequest } from './person.dto';

export interface ParentDTO {
    idParent?: number;
    idPerson: number;
    idCompany: number;
    occupation?: string;
    workplace?: string;
    workPhone?: string;
    isFinancialResponsible: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    // Datos de persona embebidos
    person?: PersonDTO;
    fullName?: string;
}

export interface ParentRequest {
    idCompany: number;
    occupation?: string;
    workplace?: string;
    workPhone?: string;
    isFinancialResponsible: boolean;
    person: PersonRequest;
}

export interface StudentParentDTO {
    idStudentParent?: number;
    idStudent: number;
    idParent: number;
    relationship: string;
    isPrimaryContact: boolean;
    isAuthorizedPickup: boolean;
    isActive?: boolean;
    // Datos expandidos
    studentName?: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
}

export interface StudentParentRequest {
    idStudent: number;
    idParent: number;
    relationship: string;
    isPrimaryContact: boolean;
    isAuthorizedPickup: boolean;
}
