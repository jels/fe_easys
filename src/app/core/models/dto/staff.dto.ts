import { PersonDTO, PersonRequest } from './person.dto';

export interface StaffDTO {
    idStaff?: number;
    idPerson: number;
    idCompany: number;
    idBranch?: number;
    branchName?: string;
    idUser?: number;
    employeeNumber: string;
    hireDate: string; // LocalDate → string ISO 'YYYY-MM-DD'
    staffType: string;
    position?: string;
    department?: string;
    specialization?: string;
    salary?: number;
    status: string;
    terminationDate?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    // Datos de persona embebidos
    person?: PersonDTO;
    fullName?: string;
}

export interface StaffRequest {
    idCompany: number;
    idBranch?: number;
    idUser?: number;
    employeeNumber: string;
    hireDate: string;
    staffType: string;
    position?: string;
    department?: string;
    specialization?: string;
    salary?: number;
    status: string;
    terminationDate?: string;
    person: PersonRequest;
}

export interface StaffSummaryDTO {
    idStaff: number;
    fullName: string;
    employeeNumber: string;
    staffType: string;
    position?: string;
    department?: string;
    status: string;
    email?: string;
    mobilePhone?: string;
}
