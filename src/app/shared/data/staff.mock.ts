// src/app/shared/data/staff.mock.ts
import { MOCK_PERSONS } from './people.mock';

export interface StaffMock {
    idStaff: number;
    idPerson: number;
    idCompany: number;
    idBranch: number;
    branchName: string;
    employeeNumber: string;
    hireDate: string;
    staffType: string; // TEACHER | ADMINISTRATIVE | SUPPORT | DIRECTOR
    position?: string;
    department?: string;
    specialization?: string;
    salary?: number;
    status: string; // ACTIVE | INACTIVE | ON_LEAVE | TERMINATED
    terminationDate?: string;
    isActive: boolean;
    createdAt: string;
    person: any;
    fullName: string;
    accessToken?: string;
    credentialIssuedAt?: string;
}

export const MOCK_STAFF: StaffMock[] = [
    {
        idStaff: 1,
        idPerson: 20,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        employeeNumber: 'EMP-2015-001',
        hireDate: '2015-02-01',
        staffType: 'DIRECTOR',
        position: 'Director General',
        department: 'Dirección',
        salary: 8500000,
        status: 'ACTIVE',
        isActive: true,
        createdAt: '2015-02-01T08:00:00',
        person: MOCK_PERSONS[15],
        fullName: 'Roberto Sánchez Duarte'
    },
    {
        idStaff: 2,
        idPerson: 21,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        employeeNumber: 'EMP-2018-002',
        hireDate: '2018-02-01',
        staffType: 'ADMINISTRATIVE',
        position: 'Secretaria General',
        department: 'Administración',
        salary: 4200000,
        status: 'ACTIVE',
        isActive: true,
        createdAt: '2018-02-01T08:00:00',
        person: MOCK_PERSONS[16],
        fullName: 'Elena Figueredo Páez'
    },
    {
        idStaff: 3,
        idPerson: 22,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        employeeNumber: 'EMP-2019-003',
        hireDate: '2019-02-01',
        staffType: 'TEACHER',
        position: 'Profesor de Matemáticas',
        department: 'Ciencias Exactas',
        specialization: 'Matemáticas, Física',
        salary: 3800000,
        status: 'ACTIVE',
        isActive: true,
        createdAt: '2019-02-01T08:00:00',
        person: MOCK_PERSONS[17],
        fullName: 'Carlos Benítez Coronel'
    },
    {
        idStaff: 4,
        idPerson: 23,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        employeeNumber: 'EMP-2020-004',
        hireDate: '2020-02-01',
        staffType: 'TEACHER',
        position: 'Profesora de Lengua',
        department: 'Humanidades',
        specialization: 'Lengua Castellana, Literatura',
        salary: 3800000,
        status: 'ACTIVE',
        isActive: true,
        createdAt: '2020-02-01T08:00:00',
        person: MOCK_PERSONS[18],
        fullName: 'Laura Valdez Ocampos'
    },
    {
        idStaff: 5,
        idPerson: 24,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        employeeNumber: 'EMP-2017-005',
        hireDate: '2017-02-01',
        staffType: 'TEACHER',
        position: 'Profesora de Ciencias Naturales',
        department: 'Ciencias',
        specialization: 'Biología, Química',
        salary: 3800000,
        status: 'ACTIVE',
        isActive: true,
        createdAt: '2017-02-01T08:00:00',
        person: MOCK_PERSONS[19],
        fullName: 'Ana Giménez Rojas'
    },
    {
        idStaff: 6,
        idPerson: 25,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        employeeNumber: 'EMP-2010-006',
        hireDate: '2010-02-01',
        staffType: 'TEACHER',
        position: 'Profesor de Historia',
        department: 'Humanidades',
        specialization: 'Historia, Geografía, Ciudadanía',
        salary: 4000000,
        status: 'ACTIVE',
        isActive: true,
        createdAt: '2010-02-01T08:00:00',
        person: MOCK_PERSONS[20],
        fullName: 'Pedro Rojas Espínola'
    },
    {
        idStaff: 7,
        idPerson: 22,
        idCompany: 1,
        idBranch: 2,
        branchName: 'Sede Norte',
        employeeNumber: 'EMP-2021-007',
        hireDate: '2021-02-01',
        staffType: 'TEACHER',
        position: 'Profesora de Inglés',
        department: 'Idiomas',
        specialization: 'Inglés',
        salary: 3600000,
        status: 'ON_LEAVE',
        isActive: true,
        createdAt: '2021-02-01T08:00:00',
        person: MOCK_PERSONS[17],
        fullName: 'María Cabrera Duarte'
    },
    {
        idStaff: 8,
        idPerson: 24,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        employeeNumber: 'EMP-2016-008',
        hireDate: '2016-02-01',
        staffType: 'SUPPORT',
        position: 'Portero / Vigilancia',
        department: 'Servicios Generales',
        salary: 2800000,
        status: 'ACTIVE',
        isActive: true,
        createdAt: '2016-02-01T08:00:00',
        person: MOCK_PERSONS[19],
        fullName: 'Jorge Méndez Villalba'
    }
];
