export interface PersonDTO {
    idPerson?: number;
    idCompany: number;
    companyName?: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    birthDate?: string; // LocalDate → string ISO 'YYYY-MM-DD'
    gender?: string;
    bloodType?: string;
    address?: string;
    city?: string;
    phone?: string;
    mobilePhone?: string;
    email?: string;
    idProfilePhoto?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface PersonRequest {
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
