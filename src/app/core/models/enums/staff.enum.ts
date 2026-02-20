export enum StaffType {
    TEACHER = 'TEACHER',
    ADMINISTRATIVE = 'ADMINISTRATIVE',
    SUPPORT = 'SUPPORT',
    DIRECTOR = 'DIRECTOR'
}

export enum StaffStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ON_LEAVE = 'ON_LEAVE',
    TERMINATED = 'TERMINATED'
}

export const STAFF_TYPE_OPTIONS = [
    { label: 'Docente', value: StaffType.TEACHER },
    { label: 'Administrativo', value: StaffType.ADMINISTRATIVE },
    { label: 'Apoyo', value: StaffType.SUPPORT },
    { label: 'Director', value: StaffType.DIRECTOR }
];

export const STAFF_STATUS_OPTIONS = [
    { label: 'Activo', value: StaffStatus.ACTIVE },
    { label: 'Inactivo', value: StaffStatus.INACTIVE },
    { label: 'De licencia', value: StaffStatus.ON_LEAVE },
    { label: 'Desvinculado', value: StaffStatus.TERMINATED }
];
