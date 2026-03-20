// src/app/core/models/parent.models.ts

import { CreatePersonRequest } from './student.dto';

export interface CreateParentRequest {
    idCompany: number;
    idPerson?: number;
    personData?: CreatePersonRequest;
    occupation?: string;
    workplace?: string;
    workPhone?: string;
    isFinancialResponsible?: boolean;
}

export interface UpdateParentRequest {
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
    occupation?: string;
    workplace?: string;
    workPhone?: string;
    isFinancialResponsible?: boolean;
}
