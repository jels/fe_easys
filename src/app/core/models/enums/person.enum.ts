export enum DocumentType {
    CI = 'CI',
    PASSPORT = 'PASSPORT',
    RUC = 'RUC',
    OTHER = 'OTHER'
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
}

export enum BloodType {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-'
}

export const DOCUMENT_TYPE_OPTIONS = [
    { label: 'Cédula de Identidad', value: DocumentType.CI },
    { label: 'Pasaporte', value: DocumentType.PASSPORT },
    { label: 'RUC', value: DocumentType.RUC },
    { label: 'Otro', value: DocumentType.OTHER }
];

export const GENDER_OPTIONS = [
    { label: 'Masculino', value: Gender.MALE },
    { label: 'Femenino', value: Gender.FEMALE },
    { label: 'Otro', value: Gender.OTHER }
];

export const BLOOD_TYPE_OPTIONS = [
    { label: 'A+', value: BloodType.A_POSITIVE },
    { label: 'A-', value: BloodType.A_NEGATIVE },
    { label: 'B+', value: BloodType.B_POSITIVE },
    { label: 'B-', value: BloodType.B_NEGATIVE },
    { label: 'AB+', value: BloodType.AB_POSITIVE },
    { label: 'AB-', value: BloodType.AB_NEGATIVE },
    { label: 'O+', value: BloodType.O_POSITIVE },
    { label: 'O-', value: BloodType.O_NEGATIVE }
];
