// src/app/shared/data/academic.mock.ts

export interface SchoolYearMock {
    idSchoolYear: number;
    idCompany: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface SchoolPeriodMock {
    idSchoolPeriod: number;
    idSchoolYear: number;
    schoolYearName?: string;
    name: string;
    periodNumber: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface GradeMock {
    idGrade: number;
    idCompany: number;
    name: string;
    level: string; // INICIAL | EEB | MEDIA
    gradeOrder: number;
    isActive: boolean;
}

export interface SectionMock {
    idSection: number;
    idCompany: number;
    idGrade: number;
    gradeName?: string;
    idSchoolYear: number;
    schoolYearName?: string;
    name: string;
    maxCapacity: number;
    idHomeroomTeacher?: number;
    homeroomTeacherName?: string;
    isActive: boolean;
}

export interface SubjectMock {
    idSubject: number;
    idCompany: number;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
}

// ── Schedule (Horarios) ───────────────────────────────────────────────────────

export interface ScheduleMock {
    idSchedule: number;
    idSection: number;
    sectionName?: string;
    gradeName?: string;
    idSubject: number;
    subjectName?: string;
    subjectCode?: string;
    idTeacher: number;
    teacherName?: string;
    dayOfWeek: number; // 1=Lunes … 5=Viernes
    dayName?: string;
    startTime: string; // 'HH:mm'
    endTime: string;
    classroom?: string;
    isActive: boolean;
}

// ── GradeScore (Calificaciones) ───────────────────────────────────────────────
// Relación: GradeScore → idStudentEnrollment (enrollment vincula alumno+sección+año)
// Para el demo usamos idStudentEnrollment como proxy de idStudent (1:1 por simplicidad)

export interface GradeScoreExMock {
    idGradeScore: number;
    idStudentEnrollment: number; // FK → student_enrollment
    idStudent: number; // desnormalizado para filtros en demo
    studentName?: string;
    idSection: number; // desnormalizado para filtros en demo
    idSubject: number;
    subjectName?: string;
    subjectCode?: string;
    idSchoolPeriod: number;
    schoolPeriodName?: string;
    periodNumber: number; // para ordenar columnas
    score: number;
    maxScore: number;
    idTeacher?: number;
    teacherName?: string;
    observations?: string;
    gradedAt?: string;
    isActive: boolean;
}

// ── School Years ─────────────────────────────────────────────────────────────
export const MOCK_SCHOOL_YEARS: SchoolYearMock[] = [
    { idSchoolYear: 1, idCompany: 1, name: 'Año Lectivo 2025', startDate: '2025-02-01', endDate: '2025-11-30', isActive: true },
    { idSchoolYear: 2, idCompany: 1, name: 'Año Lectivo 2024', startDate: '2024-02-01', endDate: '2024-11-30', isActive: false }
];

// ── School Periods ────────────────────────────────────────────────────────────
export const MOCK_SCHOOL_PERIODS: SchoolPeriodMock[] = [
    { idSchoolPeriod: 1, idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: '1er Bimestre', periodNumber: 1, startDate: '2025-02-01', endDate: '2025-04-15', isActive: true },
    { idSchoolPeriod: 2, idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: '2do Bimestre', periodNumber: 2, startDate: '2025-04-22', endDate: '2025-06-30', isActive: false },
    { idSchoolPeriod: 3, idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: '3er Bimestre', periodNumber: 3, startDate: '2025-07-15', endDate: '2025-09-30', isActive: false },
    { idSchoolPeriod: 4, idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: '4to Bimestre', periodNumber: 4, startDate: '2025-10-07', endDate: '2025-11-30', isActive: false }
];

// ── Grades ────────────────────────────────────────────────────────────────────
export const MOCK_GRADES: GradeMock[] = [
    // Inicial
    { idGrade: 1, idCompany: 1, name: 'Pre-Jardín', level: 'INICIAL', gradeOrder: 1, isActive: true },
    { idGrade: 2, idCompany: 1, name: 'Jardín', level: 'INICIAL', gradeOrder: 2, isActive: true },
    { idGrade: 3, idCompany: 1, name: 'Pre-Escolar', level: 'INICIAL', gradeOrder: 3, isActive: true },
    // EEB
    { idGrade: 4, idCompany: 1, name: '1° Grado', level: 'EEB', gradeOrder: 4, isActive: true },
    { idGrade: 5, idCompany: 1, name: '2° Grado', level: 'EEB', gradeOrder: 5, isActive: true },
    { idGrade: 6, idCompany: 1, name: '3° Grado', level: 'EEB', gradeOrder: 6, isActive: true },
    { idGrade: 7, idCompany: 1, name: '4° Grado', level: 'EEB', gradeOrder: 7, isActive: true },
    { idGrade: 8, idCompany: 1, name: '5° Grado', level: 'EEB', gradeOrder: 8, isActive: true },
    { idGrade: 9, idCompany: 1, name: '6° Grado', level: 'EEB', gradeOrder: 9, isActive: true },
    { idGrade: 10, idCompany: 1, name: '7° Grado', level: 'EEB', gradeOrder: 10, isActive: true },
    { idGrade: 11, idCompany: 1, name: '8° Grado', level: 'EEB', gradeOrder: 11, isActive: true },
    { idGrade: 12, idCompany: 1, name: '9° Grado', level: 'EEB', gradeOrder: 12, isActive: true },
    // Media
    { idGrade: 13, idCompany: 1, name: '1° Curso', level: 'MEDIA', gradeOrder: 13, isActive: true },
    { idGrade: 14, idCompany: 1, name: '2° Curso', level: 'MEDIA', gradeOrder: 14, isActive: true },
    { idGrade: 15, idCompany: 1, name: '3° Curso', level: 'MEDIA', gradeOrder: 15, isActive: true }
];

// ── Sections ──────────────────────────────────────────────────────────────────
export const MOCK_SECTIONS: SectionMock[] = [
    { idSection: 1, idCompany: 1, idGrade: 10, gradeName: '7° Grado', idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: 'A', maxCapacity: 30, idHomeroomTeacher: 3, homeroomTeacherName: 'Prof. Carlos Benítez', isActive: true },
    { idSection: 2, idCompany: 1, idGrade: 10, gradeName: '7° Grado', idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: 'B', maxCapacity: 30, idHomeroomTeacher: 4, homeroomTeacherName: 'Prof. Laura Valdez', isActive: true },
    { idSection: 3, idCompany: 1, idGrade: 11, gradeName: '8° Grado', idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: 'A', maxCapacity: 30, idHomeroomTeacher: 5, homeroomTeacherName: 'Prof. Ana Giménez', isActive: true },
    { idSection: 4, idCompany: 1, idGrade: 11, gradeName: '8° Grado', idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: 'B', maxCapacity: 30, idHomeroomTeacher: 6, homeroomTeacherName: 'Prof. Pedro Rojas', isActive: true },
    { idSection: 5, idCompany: 1, idGrade: 12, gradeName: '9° Grado', idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: 'A', maxCapacity: 28, idHomeroomTeacher: 7, homeroomTeacherName: 'Prof. María Cabrera', isActive: true },
    { idSection: 6, idCompany: 1, idGrade: 13, gradeName: '1° Curso', idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: 'A', maxCapacity: 28, idHomeroomTeacher: 8, homeroomTeacherName: 'Prof. Jorge Méndez', isActive: true },
    { idSection: 7, idCompany: 1, idGrade: 14, gradeName: '2° Curso', idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: 'A', maxCapacity: 28, idHomeroomTeacher: 9, homeroomTeacherName: 'Prof. Sandra Torres', isActive: true },
    { idSection: 8, idCompany: 1, idGrade: 15, gradeName: '3° Curso', idSchoolYear: 1, schoolYearName: 'Año Lectivo 2025', name: 'A', maxCapacity: 25, idHomeroomTeacher: 10, homeroomTeacherName: 'Prof. Diego Alvarez', isActive: true }
];

// ── Subjects ──────────────────────────────────────────────────────────────────
export const MOCK_SUBJECTS: SubjectMock[] = [
    { idSubject: 1, idCompany: 1, name: 'Matemáticas', code: 'MAT', isActive: true },
    { idSubject: 2, idCompany: 1, name: 'Lengua Castellana y Literatura', code: 'LCL', isActive: true },
    { idSubject: 3, idCompany: 1, name: 'Ciencias Naturales', code: 'CNA', isActive: true },
    { idSubject: 4, idCompany: 1, name: 'Ciencias Sociales', code: 'CSO', isActive: true },
    { idSubject: 5, idCompany: 1, name: 'Lengua Guaraní', code: 'GUA', isActive: true },
    { idSubject: 6, idCompany: 1, name: 'Inglés', code: 'ING', isActive: true },
    { idSubject: 7, idCompany: 1, name: 'Educación Física', code: 'EDF', isActive: true },
    { idSubject: 8, idCompany: 1, name: 'Educación Artística', code: 'ART', isActive: true },
    { idSubject: 9, idCompany: 1, name: 'Tecnología e Informática', code: 'TEC', isActive: true },
    { idSubject: 10, idCompany: 1, name: 'Formación Ética y Ciudadana', code: 'FEC', isActive: true },
    { idSubject: 11, idCompany: 1, name: 'Física', code: 'FIS', isActive: true },
    { idSubject: 12, idCompany: 1, name: 'Química', code: 'QUI', isActive: true }
];

export const MOCK_SCHEDULES: ScheduleMock[] = [
    // Sección 1 — 7° Grado A
    {
        idSchedule: 1,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idTeacher: 3,
        teacherName: 'Prof. Carlos Benítez',
        dayOfWeek: 1,
        dayName: 'Lunes',
        startTime: '07:00',
        endTime: '07:45',
        classroom: 'Aula 101',
        isActive: true
    },
    {
        idSchedule: 2,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 2,
        subjectName: 'Lengua Castellana',
        subjectCode: 'LCL',
        idTeacher: 4,
        teacherName: 'Prof. Laura Valdez',
        dayOfWeek: 1,
        dayName: 'Lunes',
        startTime: '07:45',
        endTime: '08:30',
        classroom: 'Aula 101',
        isActive: true
    },
    {
        idSchedule: 3,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 3,
        subjectName: 'Ciencias Naturales',
        subjectCode: 'CNA',
        idTeacher: 5,
        teacherName: 'Prof. Ana Giménez',
        dayOfWeek: 1,
        dayName: 'Lunes',
        startTime: '08:30',
        endTime: '09:15',
        classroom: 'Aula 101',
        isActive: true
    },
    {
        idSchedule: 4,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idTeacher: 3,
        teacherName: 'Prof. Carlos Benítez',
        dayOfWeek: 2,
        dayName: 'Martes',
        startTime: '07:00',
        endTime: '07:45',
        classroom: 'Aula 101',
        isActive: true
    },
    {
        idSchedule: 5,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 5,
        subjectName: 'Lengua Guaraní',
        subjectCode: 'GUA',
        idTeacher: 6,
        teacherName: 'Prof. Pedro Rojas',
        dayOfWeek: 2,
        dayName: 'Martes',
        startTime: '07:45',
        endTime: '08:30',
        classroom: 'Aula 101',
        isActive: true
    },
    {
        idSchedule: 6,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 6,
        subjectName: 'Inglés',
        subjectCode: 'ING',
        idTeacher: 7,
        teacherName: 'Prof. María Cabrera',
        dayOfWeek: 2,
        dayName: 'Martes',
        startTime: '08:30',
        endTime: '09:15',
        classroom: 'Aula 101',
        isActive: true
    },
    {
        idSchedule: 7,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 4,
        subjectName: 'Ciencias Sociales',
        subjectCode: 'CSO',
        idTeacher: 8,
        teacherName: 'Prof. Jorge Méndez',
        dayOfWeek: 3,
        dayName: 'Miércoles',
        startTime: '07:00',
        endTime: '07:45',
        classroom: 'Aula 101',
        isActive: true
    },
    {
        idSchedule: 8,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 9,
        subjectName: 'Tecnología e Informática',
        subjectCode: 'TEC',
        idTeacher: 9,
        teacherName: 'Prof. Sandra Torres',
        dayOfWeek: 3,
        dayName: 'Miércoles',
        startTime: '07:45',
        endTime: '08:30',
        classroom: 'Lab TIC',
        isActive: true
    },
    {
        idSchedule: 9,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 7,
        subjectName: 'Educación Física',
        subjectCode: 'EDF',
        idTeacher: 10,
        teacherName: 'Prof. Diego Alvarez',
        dayOfWeek: 4,
        dayName: 'Jueves',
        startTime: '07:00',
        endTime: '07:45',
        classroom: 'Patio',
        isActive: true
    },
    {
        idSchedule: 10,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 8,
        subjectName: 'Educación Artística',
        subjectCode: 'ART',
        idTeacher: 4,
        teacherName: 'Prof. Laura Valdez',
        dayOfWeek: 4,
        dayName: 'Jueves',
        startTime: '07:45',
        endTime: '08:30',
        classroom: 'Aula 101',
        isActive: true
    },
    {
        idSchedule: 11,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 10,
        subjectName: 'Formación Ética',
        subjectCode: 'FEC',
        idTeacher: 3,
        teacherName: 'Prof. Carlos Benítez',
        dayOfWeek: 5,
        dayName: 'Viernes',
        startTime: '07:00',
        endTime: '07:45',
        classroom: 'Aula 101',
        isActive: true
    },
    {
        idSchedule: 12,
        idSection: 1,
        sectionName: 'A',
        gradeName: '7° Grado',
        idSubject: 2,
        subjectName: 'Lengua Castellana',
        subjectCode: 'LCL',
        idTeacher: 4,
        teacherName: 'Prof. Laura Valdez',
        dayOfWeek: 5,
        dayName: 'Viernes',
        startTime: '07:45',
        endTime: '08:30',
        classroom: 'Aula 101',
        isActive: true
    },
    // Sección 3 — 8° Grado A
    {
        idSchedule: 13,
        idSection: 3,
        sectionName: 'A',
        gradeName: '8° Grado',
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idTeacher: 5,
        teacherName: 'Prof. Ana Giménez',
        dayOfWeek: 1,
        dayName: 'Lunes',
        startTime: '07:00',
        endTime: '07:45',
        classroom: 'Aula 201',
        isActive: true
    },
    {
        idSchedule: 14,
        idSection: 3,
        sectionName: 'A',
        gradeName: '8° Grado',
        idSubject: 11,
        subjectName: 'Física',
        subjectCode: 'FIS',
        idTeacher: 8,
        teacherName: 'Prof. Jorge Méndez',
        dayOfWeek: 1,
        dayName: 'Lunes',
        startTime: '07:45',
        endTime: '08:30',
        classroom: 'Aula 201',
        isActive: true
    },
    {
        idSchedule: 15,
        idSection: 3,
        sectionName: 'A',
        gradeName: '8° Grado',
        idSubject: 12,
        subjectName: 'Química',
        subjectCode: 'QUI',
        idTeacher: 9,
        teacherName: 'Prof. Sandra Torres',
        dayOfWeek: 2,
        dayName: 'Martes',
        startTime: '07:00',
        endTime: '07:45',
        classroom: 'Lab Quím',
        isActive: true
    }
];

export const MOCK_GRADE_SCORES: GradeScoreExMock[] = [
    // ── Sofía Martínez (idStudent:1) — Sección 1 — 1er Bimestre ──────────────
    {
        idGradeScore: 1,
        idStudentEnrollment: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSection: 1,
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 8.5,
        maxScore: 10,
        idTeacher: 3,
        teacherName: 'Prof. Carlos Benítez',
        isActive: true
    },
    {
        idGradeScore: 2,
        idStudentEnrollment: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSection: 1,
        idSubject: 2,
        subjectName: 'Lengua Castellana',
        subjectCode: 'LCL',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 9.0,
        maxScore: 10,
        idTeacher: 4,
        teacherName: 'Prof. Laura Valdez',
        isActive: true
    },
    {
        idGradeScore: 3,
        idStudentEnrollment: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSection: 1,
        idSubject: 3,
        subjectName: 'Ciencias Naturales',
        subjectCode: 'CNA',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 7.5,
        maxScore: 10,
        idTeacher: 5,
        teacherName: 'Prof. Ana Giménez',
        isActive: true
    },
    {
        idGradeScore: 4,
        idStudentEnrollment: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSection: 1,
        idSubject: 4,
        subjectName: 'Ciencias Sociales',
        subjectCode: 'CSO',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 8.0,
        maxScore: 10,
        idTeacher: 8,
        teacherName: 'Prof. Jorge Méndez',
        isActive: true
    },
    {
        idGradeScore: 5,
        idStudentEnrollment: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSection: 1,
        idSubject: 5,
        subjectName: 'Lengua Guaraní',
        subjectCode: 'GUA',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 9.5,
        maxScore: 10,
        idTeacher: 6,
        teacherName: 'Prof. Pedro Rojas',
        isActive: true
    },
    {
        idGradeScore: 6,
        idStudentEnrollment: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSection: 1,
        idSubject: 6,
        subjectName: 'Inglés',
        subjectCode: 'ING',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 8.0,
        maxScore: 10,
        idTeacher: 7,
        teacherName: 'Prof. María Cabrera',
        isActive: true
    },
    // Sofía — 2do Bimestre
    {
        idGradeScore: 7,
        idStudentEnrollment: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSection: 1,
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idSchoolPeriod: 2,
        schoolPeriodName: '2do Bimestre',
        periodNumber: 2,
        score: 7.0,
        maxScore: 10,
        idTeacher: 3,
        teacherName: 'Prof. Carlos Benítez',
        isActive: true
    },
    {
        idGradeScore: 8,
        idStudentEnrollment: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSection: 1,
        idSubject: 2,
        subjectName: 'Lengua Castellana',
        subjectCode: 'LCL',
        idSchoolPeriod: 2,
        schoolPeriodName: '2do Bimestre',
        periodNumber: 2,
        score: 8.5,
        maxScore: 10,
        idTeacher: 4,
        teacherName: 'Prof. Laura Valdez',
        isActive: true
    },
    {
        idGradeScore: 9,
        idStudentEnrollment: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSection: 1,
        idSubject: 3,
        subjectName: 'Ciencias Naturales',
        subjectCode: 'CNA',
        idSchoolPeriod: 2,
        schoolPeriodName: '2do Bimestre',
        periodNumber: 2,
        score: 8.0,
        maxScore: 10,
        idTeacher: 5,
        teacherName: 'Prof. Ana Giménez',
        isActive: true
    },
    {
        idGradeScore: 10,
        idStudentEnrollment: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSection: 1,
        idSubject: 4,
        subjectName: 'Ciencias Sociales',
        subjectCode: 'CSO',
        idSchoolPeriod: 2,
        schoolPeriodName: '2do Bimestre',
        periodNumber: 2,
        score: 7.5,
        maxScore: 10,
        idTeacher: 8,
        teacherName: 'Prof. Jorge Méndez',
        isActive: true
    },

    // ── Lucas González (idStudent:2) — Sección 1 — 1er Bimestre ──────────────
    {
        idGradeScore: 11,
        idStudentEnrollment: 2,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        idSection: 1,
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 6.0,
        maxScore: 10,
        idTeacher: 3,
        teacherName: 'Prof. Carlos Benítez',
        isActive: true
    },
    {
        idGradeScore: 12,
        idStudentEnrollment: 2,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        idSection: 1,
        idSubject: 2,
        subjectName: 'Lengua Castellana',
        subjectCode: 'LCL',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 7.0,
        maxScore: 10,
        idTeacher: 4,
        teacherName: 'Prof. Laura Valdez',
        isActive: true
    },
    {
        idGradeScore: 13,
        idStudentEnrollment: 2,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        idSection: 1,
        idSubject: 3,
        subjectName: 'Ciencias Naturales',
        subjectCode: 'CNA',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 5.5,
        maxScore: 10,
        idTeacher: 5,
        teacherName: 'Prof. Ana Giménez',
        isActive: true
    },
    {
        idGradeScore: 14,
        idStudentEnrollment: 2,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        idSection: 1,
        idSubject: 4,
        subjectName: 'Ciencias Sociales',
        subjectCode: 'CSO',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 7.5,
        maxScore: 10,
        idTeacher: 8,
        teacherName: 'Prof. Jorge Méndez',
        isActive: true
    },
    // Lucas — 2do Bimestre
    {
        idGradeScore: 15,
        idStudentEnrollment: 2,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        idSection: 1,
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idSchoolPeriod: 2,
        schoolPeriodName: '2do Bimestre',
        periodNumber: 2,
        score: 6.5,
        maxScore: 10,
        idTeacher: 3,
        teacherName: 'Prof. Carlos Benítez',
        isActive: true
    },
    {
        idGradeScore: 16,
        idStudentEnrollment: 2,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        idSection: 1,
        idSubject: 2,
        subjectName: 'Lengua Castellana',
        subjectCode: 'LCL',
        idSchoolPeriod: 2,
        schoolPeriodName: '2do Bimestre',
        periodNumber: 2,
        score: 7.5,
        maxScore: 10,
        idTeacher: 4,
        teacherName: 'Prof. Laura Valdez',
        isActive: true
    },

    // ── Valentina Ramírez (idStudent:3) — Sección 1 — 1er Bimestre ───────────
    {
        idGradeScore: 17,
        idStudentEnrollment: 3,
        idStudent: 3,
        studentName: 'Valentina Ramírez Silva',
        idSection: 1,
        idSubject: 1,
        subjectName: 'Matemáticas',
        subjectCode: 'MAT',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 9.5,
        maxScore: 10,
        idTeacher: 3,
        teacherName: 'Prof. Carlos Benítez',
        isActive: true
    },
    {
        idGradeScore: 18,
        idStudentEnrollment: 3,
        idStudent: 3,
        studentName: 'Valentina Ramírez Silva',
        idSection: 1,
        idSubject: 2,
        subjectName: 'Lengua Castellana',
        subjectCode: 'LCL',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 9.0,
        maxScore: 10,
        idTeacher: 4,
        teacherName: 'Prof. Laura Valdez',
        isActive: true
    },
    {
        idGradeScore: 19,
        idStudentEnrollment: 3,
        idStudent: 3,
        studentName: 'Valentina Ramírez Silva',
        idSection: 1,
        idSubject: 3,
        subjectName: 'Ciencias Naturales',
        subjectCode: 'CNA',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 8.5,
        maxScore: 10,
        idTeacher: 5,
        teacherName: 'Prof. Ana Giménez',
        isActive: true
    },
    {
        idGradeScore: 20,
        idStudentEnrollment: 3,
        idStudent: 3,
        studentName: 'Valentina Ramírez Silva',
        idSection: 1,
        idSubject: 4,
        subjectName: 'Ciencias Sociales',
        subjectCode: 'CSO',
        idSchoolPeriod: 1,
        schoolPeriodName: '1er Bimestre',
        periodNumber: 1,
        score: 10.0,
        maxScore: 10,
        idTeacher: 8,
        teacherName: 'Prof. Jorge Méndez',
        isActive: true
    }
];
