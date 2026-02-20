export enum StudentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    GRADUATED = 'GRADUATED',
    TRANSFERRED = 'TRANSFERRED',
    WITHDRAWN = 'WITHDRAWN'
}

export const STUDENT_STATUS_OPTIONS = [
    { label: 'Activo', value: StudentStatus.ACTIVE },
    { label: 'Inactivo', value: StudentStatus.INACTIVE },
    { label: 'Egresado', value: StudentStatus.GRADUATED },
    { label: 'Transferido', value: StudentStatus.TRANSFERRED },
    { label: 'Retirado', value: StudentStatus.WITHDRAWN }
];

export const RELATIONSHIP_OPTIONS = [
    { label: 'Padre', value: 'FATHER' },
    { label: 'Madre', value: 'MOTHER' },
    { label: 'Tutor Legal', value: 'LEGAL_GUARDIAN' },
    { label: 'Abuelo/a', value: 'GRANDPARENT' },
    { label: 'Tío/a', value: 'UNCLE_AUNT' },
    { label: 'Hermano/a', value: 'SIBLING' },
    { label: 'Otro', value: 'OTHER' }
];
