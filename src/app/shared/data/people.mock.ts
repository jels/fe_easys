// src/app/shared/data/people.mock.ts

export interface PersonMock {
    idPerson: number;
    idCompany: number;
    firstName: string;
    lastName: string;
    fullName: string;
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
    isActive: boolean;
    createdAt: string;
}

export interface StudentMock {
    idStudent: number;
    idPerson: number;
    idCompany: number;
    idBranch: number;
    branchName: string;
    enrollmentNumber: string;
    enrollmentDate: string;
    status: string; // ACTIVE | INACTIVE | GRADUATED | TRANSFERRED | WITHDRAWN
    idCurrentGrade: number;
    gradeName: string;
    gradeLevel: string;
    idCurrentSection: number;
    sectionName: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    medicalObservations?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    person: PersonMock;
    fullName: string;
}

export interface ParentMock {
    idParent: number;
    idPerson: number;
    idCompany: number;
    occupation?: string;
    workplace?: string;
    workPhone?: string;
    isFinancialResponsible: boolean;
    isActive: boolean;
    createdAt: string;
    person: PersonMock;
    fullName: string;
}

export interface StudentParentMock {
    idStudentParent: number;
    idStudent: number;
    idParent: number;
    relationship: string;
    isPrimaryContact: boolean;
    isAuthorizedPickup: boolean;
    isActive: boolean;
    studentName?: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
}

// ── Persons ───────────────────────────────────────────────────────────────────
export const MOCK_PERSONS: PersonMock[] = [
    // Estudiantes (1-15)
    {
        idPerson: 1,
        idCompany: 1,
        firstName: 'Sofía',
        lastName: 'Martínez López',
        fullName: 'Sofía Martínez López',
        documentType: 'CI',
        documentNumber: '5123456',
        birthDate: '2010-03-15',
        gender: 'FEMALE',
        bloodType: 'O+',
        city: 'Asunción',
        mobilePhone: '0981-111001',
        email: 'sofia.martinez@colegio.edu.py',
        isActive: true,
        createdAt: '2023-02-01T08:00:00'
    },
    {
        idPerson: 2,
        idCompany: 1,
        firstName: 'Lucas',
        lastName: 'González Benítez',
        fullName: 'Lucas González Benítez',
        documentType: 'CI',
        documentNumber: '5234567',
        birthDate: '2009-07-22',
        gender: 'MALE',
        bloodType: 'A+',
        city: 'Asunción',
        mobilePhone: '0981-111002',
        email: 'lucas.gonzalez@colegio.edu.py',
        isActive: true,
        createdAt: '2023-02-01T08:05:00'
    },
    {
        idPerson: 3,
        idCompany: 1,
        firstName: 'Valentina',
        lastName: 'Ramírez Silva',
        fullName: 'Valentina Ramírez Silva',
        documentType: 'CI',
        documentNumber: '5345678',
        birthDate: '2011-01-10',
        gender: 'FEMALE',
        bloodType: 'B+',
        city: 'Luque',
        mobilePhone: '0981-111003',
        email: 'valentina.ramirez@colegio.edu.py',
        isActive: true,
        createdAt: '2024-02-01T08:10:00'
    },
    {
        idPerson: 4,
        idCompany: 1,
        firstName: 'Mateo',
        lastName: 'Fernández Torres',
        fullName: 'Mateo Fernández Torres',
        documentType: 'CI',
        documentNumber: '5456789',
        birthDate: '2008-11-30',
        gender: 'MALE',
        bloodType: 'O-',
        city: 'San Lorenzo',
        mobilePhone: '0981-111004',
        email: 'mateo.fernandez@colegio.edu.py',
        isActive: true,
        createdAt: '2022-02-01T08:15:00'
    },
    {
        idPerson: 5,
        idCompany: 1,
        firstName: 'Isabella',
        lastName: 'Díaz Morales',
        fullName: 'Isabella Díaz Morales',
        documentType: 'CI',
        documentNumber: '5567890',
        birthDate: '2010-05-18',
        gender: 'FEMALE',
        bloodType: 'AB+',
        city: 'Asunción',
        mobilePhone: '0981-111005',
        email: 'isabella.diaz@colegio.edu.py',
        isActive: true,
        createdAt: '2023-02-01T08:20:00'
    },
    {
        idPerson: 6,
        idCompany: 1,
        firstName: 'Santiago',
        lastName: 'Ortiz Cabrera',
        fullName: 'Santiago Ortiz Cabrera',
        documentType: 'CI',
        documentNumber: '5678901',
        birthDate: '2009-09-25',
        gender: 'MALE',
        bloodType: 'A-',
        city: 'Asunción',
        mobilePhone: '0981-111006',
        email: 'santiago.ortiz@colegio.edu.py',
        isActive: true,
        createdAt: '2023-02-01T08:25:00'
    },
    {
        idPerson: 7,
        idCompany: 1,
        firstName: 'Camila',
        lastName: 'Méndez Villalba',
        fullName: 'Camila Méndez Villalba',
        documentType: 'CI',
        documentNumber: '5789012',
        birthDate: '2011-12-08',
        gender: 'FEMALE',
        bloodType: 'O+',
        city: 'Fernando de la Mora',
        mobilePhone: '0981-111007',
        email: 'camila.mendez@colegio.edu.py',
        isActive: true,
        createdAt: '2024-02-01T08:30:00'
    },
    {
        idPerson: 8,
        idCompany: 1,
        firstName: 'Sebastián',
        lastName: 'Pereira Aguayo',
        fullName: 'Sebastián Pereira Aguayo',
        documentType: 'CI',
        documentNumber: '5890123',
        birthDate: '2008-04-14',
        gender: 'MALE',
        bloodType: 'B-',
        city: 'Asunción',
        mobilePhone: '0981-111008',
        email: 'sebastian.pereira@colegio.edu.py',
        isActive: true,
        createdAt: '2022-02-01T08:35:00'
    },
    {
        idPerson: 9,
        idCompany: 1,
        firstName: 'Luciana',
        lastName: 'Vega Estigarribia',
        fullName: 'Luciana Vega Estigarribia',
        documentType: 'CI',
        documentNumber: '5901234',
        birthDate: '2010-08-03',
        gender: 'FEMALE',
        bloodType: 'A+',
        city: 'Asunción',
        mobilePhone: '0981-111009',
        email: 'luciana.vega@colegio.edu.py',
        isActive: true,
        createdAt: '2023-02-01T08:40:00'
    },
    {
        idPerson: 10,
        idCompany: 1,
        firstName: 'Nicolás',
        lastName: 'Acosta Rivarola',
        fullName: 'Nicolás Acosta Rivarola',
        documentType: 'CI',
        documentNumber: '6012345',
        birthDate: '2009-02-28',
        gender: 'MALE',
        bloodType: 'O+',
        city: 'Lambaré',
        mobilePhone: '0981-111010',
        email: 'nicolas.acosta@colegio.edu.py',
        isActive: true,
        createdAt: '2023-02-01T08:45:00'
    },
    {
        idPerson: 11,
        idCompany: 1,
        firstName: 'Florencia',
        lastName: 'Sosa Núñez',
        fullName: 'Florencia Sosa Núñez',
        documentType: 'CI',
        documentNumber: '6123456',
        birthDate: '2011-06-17',
        gender: 'FEMALE',
        bloodType: 'B+',
        city: 'Asunción',
        mobilePhone: '0981-111011',
        email: 'florencia.sosa@colegio.edu.py',
        isActive: true,
        createdAt: '2024-02-01T08:50:00'
    },
    {
        idPerson: 12,
        idCompany: 1,
        firstName: 'Joaquín',
        lastName: 'Amarilla Genes',
        fullName: 'Joaquín Amarilla Genes',
        documentType: 'CI',
        documentNumber: '6234567',
        birthDate: '2008-10-20',
        gender: 'MALE',
        bloodType: 'A+',
        city: 'Asunción',
        mobilePhone: '0981-111012',
        email: 'joaquin.amarilla@colegio.edu.py',
        isActive: false,
        createdAt: '2022-02-01T08:55:00'
    },
    {
        idPerson: 13,
        idCompany: 1,
        firstName: 'Ana Clara',
        lastName: 'Bogado Cristaldo',
        fullName: 'Ana Clara Bogado Cristaldo',
        documentType: 'CI',
        documentNumber: '6345678',
        birthDate: '2010-03-05',
        gender: 'FEMALE',
        bloodType: 'O-',
        city: 'Capiatá',
        mobilePhone: '0981-111013',
        email: 'anaclara.bogado@colegio.edu.py',
        isActive: true,
        createdAt: '2023-02-01T09:00:00'
    },
    {
        idPerson: 14,
        idCompany: 1,
        firstName: 'Franco',
        lastName: 'Britez Zárate',
        fullName: 'Franco Britez Zárate',
        documentType: 'CI',
        documentNumber: '6456789',
        birthDate: '2009-11-12',
        gender: 'MALE',
        bloodType: 'AB-',
        city: 'Asunción',
        mobilePhone: '0981-111014',
        email: 'franco.britez@colegio.edu.py',
        isActive: true,
        createdAt: '2023-02-01T09:05:00'
    },
    {
        idPerson: 15,
        idCompany: 1,
        firstName: 'Renata',
        lastName: 'Chamorro Fleitas',
        fullName: 'Renata Chamorro Fleitas',
        documentType: 'CI',
        documentNumber: '6567890',
        birthDate: '2011-09-23',
        gender: 'FEMALE',
        bloodType: 'O+',
        city: 'Asunción',
        mobilePhone: '0981-111015',
        email: 'renata.chamorro@colegio.edu.py',
        isActive: true,
        createdAt: '2024-02-01T09:10:00'
    },
    // Staff (20-32)
    {
        idPerson: 20,
        idCompany: 1,
        firstName: 'Roberto',
        lastName: 'Sánchez Duarte',
        fullName: 'Roberto Sánchez Duarte',
        documentType: 'CI',
        documentNumber: '3112233',
        birthDate: '1978-05-10',
        gender: 'MALE',
        city: 'Asunción',
        mobilePhone: '0981-200001',
        email: 'r.sanchez@colegiosanjose.edu.py',
        isActive: true,
        createdAt: '2015-02-01T08:00:00'
    },
    {
        idPerson: 21,
        idCompany: 1,
        firstName: 'Elena',
        lastName: 'Figueredo Páez',
        fullName: 'Elena Figueredo Páez',
        documentType: 'CI',
        documentNumber: '3223344',
        birthDate: '1982-09-15',
        gender: 'FEMALE',
        city: 'Asunción',
        mobilePhone: '0981-200002',
        email: 'e.figueredo@colegiosanjose.edu.py',
        isActive: true,
        createdAt: '2018-02-01T08:00:00'
    },
    {
        idPerson: 22,
        idCompany: 1,
        firstName: 'Carlos',
        lastName: 'Benítez Coronel',
        fullName: 'Carlos Benítez Coronel',
        documentType: 'CI',
        documentNumber: '3334455',
        birthDate: '1985-03-22',
        gender: 'MALE',
        city: 'Asunción',
        mobilePhone: '0981-200003',
        email: 'c.benitez@colegiosanjose.edu.py',
        isActive: true,
        createdAt: '2019-02-01T08:00:00'
    },
    {
        idPerson: 23,
        idCompany: 1,
        firstName: 'Laura',
        lastName: 'Valdez Ocampos',
        fullName: 'Laura Valdez Ocampos',
        documentType: 'CI',
        documentNumber: '3445566',
        birthDate: '1990-07-08',
        gender: 'FEMALE',
        city: 'San Lorenzo',
        mobilePhone: '0981-200004',
        email: 'l.valdez@colegiosanjose.edu.py',
        isActive: true,
        createdAt: '2020-02-01T08:00:00'
    },
    {
        idPerson: 24,
        idCompany: 1,
        firstName: 'Ana',
        lastName: 'Giménez Rojas',
        fullName: 'Ana Giménez Rojas',
        documentType: 'CI',
        documentNumber: '3556677',
        birthDate: '1988-11-30',
        gender: 'FEMALE',
        city: 'Asunción',
        mobilePhone: '0981-200005',
        email: 'a.gimenez@colegiosanjose.edu.py',
        isActive: true,
        createdAt: '2017-02-01T08:00:00'
    },
    {
        idPerson: 25,
        idCompany: 1,
        firstName: 'Pedro',
        lastName: 'Rojas Espínola',
        fullName: 'Pedro Rojas Espínola',
        documentType: 'CI',
        documentNumber: '3667788',
        birthDate: '1975-04-18',
        gender: 'MALE',
        city: 'Asunción',
        mobilePhone: '0981-200006',
        email: 'p.rojas@colegiosanjose.edu.py',
        isActive: true,
        createdAt: '2010-02-01T08:00:00'
    },
    // Padres (40-52)
    {
        idPerson: 40,
        idCompany: 1,
        firstName: 'Patricia',
        lastName: 'López de Martínez',
        fullName: 'Patricia López de Martínez',
        documentType: 'CI',
        documentNumber: '4001122',
        birthDate: '1980-06-12',
        gender: 'FEMALE',
        city: 'Asunción',
        mobilePhone: '0981-400001',
        email: 'patricia.martinez@gmail.com',
        isActive: true,
        createdAt: '2023-02-01T08:00:00'
    },
    {
        idPerson: 41,
        idCompany: 1,
        firstName: 'Jorge',
        lastName: 'González Acuña',
        fullName: 'Jorge González Acuña',
        documentType: 'CI',
        documentNumber: '4112233',
        birthDate: '1977-09-25',
        gender: 'MALE',
        city: 'Asunción',
        mobilePhone: '0981-400002',
        email: 'j.gonzalez@gmail.com',
        isActive: true,
        createdAt: '2023-02-01T08:00:00'
    },
    {
        idPerson: 42,
        idCompany: 1,
        firstName: 'Susana',
        lastName: 'Benítez de Ramírez',
        fullName: 'Susana Benítez de Ramírez',
        documentType: 'CI',
        documentNumber: '4223344',
        birthDate: '1984-02-14',
        gender: 'FEMALE',
        city: 'Luque',
        mobilePhone: '0981-400003',
        email: 'susana.ramirez@gmail.com',
        isActive: true,
        createdAt: '2024-02-01T08:00:00'
    },
    {
        idPerson: 43,
        idCompany: 1,
        firstName: 'Alberto',
        lastName: 'Fernández Casco',
        fullName: 'Alberto Fernández Casco',
        documentType: 'CI',
        documentNumber: '4334455',
        birthDate: '1975-11-08',
        gender: 'MALE',
        city: 'San Lorenzo',
        mobilePhone: '0981-400004',
        email: 'a.fernandez@gmail.com',
        isActive: true,
        createdAt: '2022-02-01T08:00:00'
    }
];

// ── Students ──────────────────────────────────────────────────────────────────
export const MOCK_STUDENTS: StudentMock[] = [
    {
        idStudent: 1,
        idPerson: 1,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2025-0001',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 11,
        gradeName: '8° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 3,
        sectionName: 'A',
        emergencyContactName: 'Patricia López de Martínez',
        emergencyContactPhone: '0981-400001',
        emergencyContactRelationship: 'MOTHER',
        medicalObservations: 'Asma leve. Usar inhalador en caso de crisis.',
        isActive: true,
        createdAt: '2025-02-01T08:00:00',
        updatedAt: '2025-02-01T08:00:00',
        person: MOCK_PERSONS[0],
        fullName: 'Sofía Martínez López'
    },
    {
        idStudent: 2,
        idPerson: 2,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2025-0002',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 12,
        gradeName: '9° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 5,
        sectionName: 'A',
        emergencyContactName: 'Jorge González Acuña',
        emergencyContactPhone: '0981-400002',
        emergencyContactRelationship: 'FATHER',
        isActive: true,
        createdAt: '2025-02-01T08:05:00',
        updatedAt: '2025-02-01T08:05:00',
        person: MOCK_PERSONS[1],
        fullName: 'Lucas González Benítez'
    },
    {
        idStudent: 3,
        idPerson: 3,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2025-0003',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 10,
        gradeName: '7° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 1,
        sectionName: 'A',
        emergencyContactName: 'Susana Benítez de Ramírez',
        emergencyContactPhone: '0981-400003',
        emergencyContactRelationship: 'MOTHER',
        isActive: true,
        createdAt: '2025-02-01T08:10:00',
        updatedAt: '2025-02-01T08:10:00',
        person: MOCK_PERSONS[2],
        fullName: 'Valentina Ramírez Silva'
    },
    {
        idStudent: 4,
        idPerson: 4,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2023-0004',
        enrollmentDate: '2023-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 13,
        gradeName: '1° Curso',
        gradeLevel: 'MEDIA',
        idCurrentSection: 6,
        sectionName: 'A',
        emergencyContactName: 'Alberto Fernández Casco',
        emergencyContactPhone: '0981-400004',
        emergencyContactRelationship: 'FATHER',
        isActive: true,
        createdAt: '2023-02-01T08:15:00',
        updatedAt: '2025-02-01T08:15:00',
        person: MOCK_PERSONS[3],
        fullName: 'Mateo Fernández Torres'
    },
    {
        idStudent: 5,
        idPerson: 5,
        idCompany: 1,
        idBranch: 2,
        branchName: 'Sede Norte',
        enrollmentNumber: 'EST-2025-0005',
        enrollmentDate: '2025-02-01',
        status: 'INACTIVE',
        idCurrentGrade: 11,
        gradeName: '8° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 4,
        sectionName: 'B',
        emergencyContactName: 'Patricia Morales',
        emergencyContactPhone: '0981-500001',
        emergencyContactRelationship: 'MOTHER',
        isActive: false,
        createdAt: '2025-02-01T08:20:00',
        updatedAt: '2025-02-15T10:00:00',
        person: MOCK_PERSONS[4],
        fullName: 'Isabella Díaz Morales'
    },
    {
        idStudent: 6,
        idPerson: 6,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2025-0006',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 12,
        gradeName: '9° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 5,
        sectionName: 'A',
        emergencyContactName: 'Carmen Ortiz',
        emergencyContactPhone: '0981-500002',
        emergencyContactRelationship: 'MOTHER',
        isActive: true,
        createdAt: '2025-02-01T08:25:00',
        updatedAt: '2025-02-01T08:25:00',
        person: MOCK_PERSONS[5],
        fullName: 'Santiago Ortiz Cabrera'
    },
    {
        idStudent: 7,
        idPerson: 7,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2025-0007',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 10,
        gradeName: '7° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 2,
        sectionName: 'B',
        emergencyContactName: 'Carmen Villalba',
        emergencyContactPhone: '0981-500003',
        emergencyContactRelationship: 'MOTHER',
        isActive: true,
        createdAt: '2025-02-01T08:30:00',
        updatedAt: '2025-02-01T08:30:00',
        person: MOCK_PERSONS[6],
        fullName: 'Camila Méndez Villalba'
    },
    {
        idStudent: 8,
        idPerson: 8,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2022-0008',
        enrollmentDate: '2022-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 14,
        gradeName: '2° Curso',
        gradeLevel: 'MEDIA',
        idCurrentSection: 7,
        sectionName: 'A',
        emergencyContactName: 'Ángel Pereira',
        emergencyContactPhone: '0981-500004',
        emergencyContactRelationship: 'FATHER',
        isActive: true,
        createdAt: '2022-02-01T08:35:00',
        updatedAt: '2025-02-01T08:35:00',
        person: MOCK_PERSONS[7],
        fullName: 'Sebastián Pereira Aguayo'
    },
    {
        idStudent: 9,
        idPerson: 9,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2025-0009',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 11,
        gradeName: '8° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 3,
        sectionName: 'A',
        emergencyContactName: 'Andrea Estigarribia',
        emergencyContactPhone: '0981-500005',
        emergencyContactRelationship: 'MOTHER',
        isActive: true,
        createdAt: '2025-02-01T08:40:00',
        updatedAt: '2025-02-01T08:40:00',
        person: MOCK_PERSONS[8],
        fullName: 'Luciana Vega Estigarribia'
    },
    {
        idStudent: 10,
        idPerson: 10,
        idCompany: 1,
        idBranch: 2,
        branchName: 'Sede Norte',
        enrollmentNumber: 'EST-2025-0010',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 12,
        gradeName: '9° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 5,
        sectionName: 'A',
        emergencyContactName: 'Roberto Acosta',
        emergencyContactPhone: '0981-500006',
        emergencyContactRelationship: 'FATHER',
        isActive: true,
        createdAt: '2025-02-01T08:45:00',
        updatedAt: '2025-02-01T08:45:00',
        person: MOCK_PERSONS[9],
        fullName: 'Nicolás Acosta Rivarola'
    },
    {
        idStudent: 11,
        idPerson: 11,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2025-0011',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 10,
        gradeName: '7° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 2,
        sectionName: 'B',
        emergencyContactName: 'Fernando Sosa',
        emergencyContactPhone: '0981-500007',
        emergencyContactRelationship: 'FATHER',
        isActive: true,
        createdAt: '2025-02-01T08:50:00',
        updatedAt: '2025-02-01T08:50:00',
        person: MOCK_PERSONS[10],
        fullName: 'Florencia Sosa Núñez'
    },
    {
        idStudent: 12,
        idPerson: 12,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2022-0012',
        enrollmentDate: '2022-02-01',
        status: 'WITHDRAWN',
        idCurrentGrade: 15,
        gradeName: '3° Curso',
        gradeLevel: 'MEDIA',
        idCurrentSection: 8,
        sectionName: 'A',
        isActive: false,
        createdAt: '2022-02-01T08:55:00',
        updatedAt: '2025-01-20T12:00:00',
        person: MOCK_PERSONS[11],
        fullName: 'Joaquín Amarilla Genes'
    },
    {
        idStudent: 13,
        idPerson: 13,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2025-0013',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 11,
        gradeName: '8° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 4,
        sectionName: 'B',
        emergencyContactName: 'Ricardo Bogado',
        emergencyContactPhone: '0981-500008',
        emergencyContactRelationship: 'FATHER',
        isActive: true,
        createdAt: '2025-02-01T09:00:00',
        updatedAt: '2025-02-01T09:00:00',
        person: MOCK_PERSONS[12],
        fullName: 'Ana Clara Bogado Cristaldo'
    },
    {
        idStudent: 14,
        idPerson: 14,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2025-0014',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 12,
        gradeName: '9° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 5,
        sectionName: 'A',
        emergencyContactName: 'Martha Zárate',
        emergencyContactPhone: '0981-500009',
        emergencyContactRelationship: 'MOTHER',
        isActive: true,
        createdAt: '2025-02-01T09:05:00',
        updatedAt: '2025-02-01T09:05:00',
        person: MOCK_PERSONS[13],
        fullName: 'Franco Britez Zárate'
    },
    {
        idStudent: 15,
        idPerson: 15,
        idCompany: 1,
        idBranch: 1,
        branchName: 'Sede Central',
        enrollmentNumber: 'EST-2025-0015',
        enrollmentDate: '2025-02-01',
        status: 'ACTIVE',
        idCurrentGrade: 10,
        gradeName: '7° Grado',
        gradeLevel: 'EEB',
        idCurrentSection: 1,
        sectionName: 'A',
        emergencyContactName: 'José Chamorro',
        emergencyContactPhone: '0981-500010',
        emergencyContactRelationship: 'FATHER',
        isActive: true,
        createdAt: '2025-02-01T09:10:00',
        updatedAt: '2025-02-01T09:10:00',
        person: MOCK_PERSONS[14],
        fullName: 'Renata Chamorro Fleitas'
    }
];

// ── Parents ───────────────────────────────────────────────────────────────────
export const MOCK_PARENTS: ParentMock[] = [
    {
        idParent: 1,
        idPerson: 40,
        idCompany: 1,
        occupation: 'Contadora',
        workplace: 'Empresa XYZ SA',
        workPhone: '021-301001',
        isFinancialResponsible: true,
        isActive: true,
        createdAt: '2023-02-01T08:00:00',
        person: MOCK_PERSONS[20],
        fullName: 'Patricia López de Martínez'
    },
    {
        idParent: 2,
        idPerson: 41,
        idCompany: 1,
        occupation: 'Ingeniero',
        workplace: 'Constructora ABC',
        workPhone: '021-301002',
        isFinancialResponsible: false,
        isActive: true,
        createdAt: '2023-02-01T08:00:00',
        person: MOCK_PERSONS[21],
        fullName: 'Jorge González Acuña'
    },
    {
        idParent: 3,
        idPerson: 42,
        idCompany: 1,
        occupation: 'Médica',
        workplace: 'Hospital Nacional',
        workPhone: '021-301003',
        isFinancialResponsible: true,
        isActive: true,
        createdAt: '2024-02-01T08:00:00',
        person: MOCK_PERSONS[22],
        fullName: 'Susana Benítez de Ramírez'
    },
    {
        idParent: 4,
        idPerson: 43,
        idCompany: 1,
        occupation: 'Abogado',
        workplace: 'Estudio Jurídico FG',
        workPhone: '021-301004',
        isFinancialResponsible: true,
        isActive: true,
        createdAt: '2022-02-01T08:00:00',
        person: MOCK_PERSONS[23],
        fullName: 'Alberto Fernández Casco'
    }
];

// ── Student-Parent relations ──────────────────────────────────────────────────
export const MOCK_STUDENT_PARENTS: StudentParentMock[] = [
    {
        idStudentParent: 1,
        idStudent: 1,
        idParent: 1,
        relationship: 'MOTHER',
        isPrimaryContact: true,
        isAuthorizedPickup: true,
        isActive: true,
        studentName: 'Sofía Martínez López',
        parentName: 'Patricia López de Martínez',
        parentPhone: '0981-400001',
        parentEmail: 'patricia.martinez@gmail.com'
    },
    {
        idStudentParent: 2,
        idStudent: 2,
        idParent: 2,
        relationship: 'FATHER',
        isPrimaryContact: true,
        isAuthorizedPickup: true,
        isActive: true,
        studentName: 'Lucas González Benítez',
        parentName: 'Jorge González Acuña',
        parentPhone: '0981-400002',
        parentEmail: 'j.gonzalez@gmail.com'
    },
    {
        idStudentParent: 3,
        idStudent: 3,
        idParent: 3,
        relationship: 'MOTHER',
        isPrimaryContact: true,
        isAuthorizedPickup: true,
        isActive: true,
        studentName: 'Valentina Ramírez Silva',
        parentName: 'Susana Benítez de Ramírez',
        parentPhone: '0981-400003',
        parentEmail: 'susana.ramirez@gmail.com'
    },
    {
        idStudentParent: 4,
        idStudent: 4,
        idParent: 4,
        relationship: 'FATHER',
        isPrimaryContact: true,
        isAuthorizedPickup: true,
        isActive: true,
        studentName: 'Mateo Fernández Torres',
        parentName: 'Alberto Fernández Casco',
        parentPhone: '0981-400004',
        parentEmail: 'a.fernandez@gmail.com'
    },
    {
        idStudentParent: 5,
        idStudent: 1,
        idParent: 2,
        relationship: 'FATHER',
        isPrimaryContact: false,
        isAuthorizedPickup: true,
        isActive: true,
        studentName: 'Sofía Martínez López',
        parentName: 'Jorge González Acuña',
        parentPhone: '0981-400002',
        parentEmail: 'j.gonzalez@gmail.com'
    }
];
