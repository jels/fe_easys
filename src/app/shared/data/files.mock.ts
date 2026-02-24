// src/app/shared/data/files.mock.ts
// Alineado a ea_files en la BD

export type FileEntityType = 'STUDENT' | 'STAFF' | 'DOCUMENT' | 'OTHER';

export interface FileMock {
    idFile: number;
    idCompany: number;
    entityType: FileEntityType;
    idEntity: number; // idStudent o idStaff según entityType
    fileName: string;
    fileUrl: string; // URL pública (en demo: assets/img/demo/)
    mimeType: string;
    fileSize: number; // bytes
    isPrimary: boolean; // foto principal del perfil
    isActive: boolean;
    createdAt: string;
}

// Demo: usamos una URL de avatar genérico basado en iniciales
// En producción apuntaría al endpoint de archivos del backend
const AVATAR_BASE = 'https://ui-avatars.com/api/?background=1e3a5f&color=fff&bold=true&size=200&name=';

export const MOCK_FILES: FileMock[] = [
    // ── Fotos de alumnos ───────────────────────────────────────────────────────
    { idFile: 1, idCompany: 1, entityType: 'STUDENT', idEntity: 1, fileName: 'sofia-martinez.jpg', fileUrl: `assets/img/perfildemo.jpg`, mimeType: 'image/jpeg', fileSize: 48200, isPrimary: true, isActive: true, createdAt: '2025-02-01T10:00:00' },
    { idFile: 2, idCompany: 1, entityType: 'STUDENT', idEntity: 2, fileName: 'lucas-gonzalez.jpg', fileUrl: `${AVATAR_BASE}Lucas+González`, mimeType: 'image/jpeg', fileSize: 51300, isPrimary: true, isActive: true, createdAt: '2025-02-01T10:05:00' },
    {
        idFile: 3,
        idCompany: 1,
        entityType: 'STUDENT',
        idEntity: 3,
        fileName: 'valentina-ramirez.jpg',
        fileUrl: `${AVATAR_BASE}Valentina+Ramírez`,
        mimeType: 'image/jpeg',
        fileSize: 44800,
        isPrimary: true,
        isActive: true,
        createdAt: '2025-02-01T10:10:00'
    },
    {
        idFile: 4,
        idCompany: 1,
        entityType: 'STUDENT',
        idEntity: 4,
        fileName: 'mateo-fernandez.jpg',
        fileUrl: `${AVATAR_BASE}Mateo+Fernández`,
        mimeType: 'image/jpeg',
        fileSize: 49600,
        isPrimary: true,
        isActive: true,
        createdAt: '2025-02-01T10:15:00'
    },
    { idFile: 5, idCompany: 1, entityType: 'STUDENT', idEntity: 5, fileName: 'isabella-diaz.jpg', fileUrl: `${AVATAR_BASE}Isabella+Díaz`, mimeType: 'image/jpeg', fileSize: 46100, isPrimary: true, isActive: true, createdAt: '2025-02-01T10:20:00' },
    { idFile: 6, idCompany: 1, entityType: 'STUDENT', idEntity: 6, fileName: 'santiago-ortiz.jpg', fileUrl: `${AVATAR_BASE}Santiago+Ortiz`, mimeType: 'image/jpeg', fileSize: 52400, isPrimary: true, isActive: true, createdAt: '2025-02-01T10:25:00' },
    { idFile: 7, idCompany: 1, entityType: 'STUDENT', idEntity: 7, fileName: 'camila-rojas.jpg', fileUrl: `${AVATAR_BASE}Camila+Rojas`, mimeType: 'image/jpeg', fileSize: 47000, isPrimary: true, isActive: true, createdAt: '2025-02-01T10:30:00' },
    { idFile: 8, idCompany: 1, entityType: 'STUDENT', idEntity: 8, fileName: 'diego-torres.jpg', fileUrl: `${AVATAR_BASE}Diego+Torres`, mimeType: 'image/jpeg', fileSize: 50100, isPrimary: true, isActive: true, createdAt: '2025-02-01T10:35:00' },
    // ── Fotos de personal ──────────────────────────────────────────────────────
    { idFile: 10, idCompany: 1, entityType: 'STAFF', idEntity: 1, fileName: 'roberto-sanchez.jpg', fileUrl: `${AVATAR_BASE}Roberto+Sánchez`, mimeType: 'image/jpeg', fileSize: 55000, isPrimary: true, isActive: true, createdAt: '2025-01-15T09:00:00' },
    { idFile: 11, idCompany: 1, entityType: 'STAFF', idEntity: 2, fileName: 'elena-figueredo.jpg', fileUrl: `${AVATAR_BASE}Elena+Figueredo`, mimeType: 'image/jpeg', fileSize: 53200, isPrimary: true, isActive: true, createdAt: '2025-01-15T09:05:00' },
    { idFile: 12, idCompany: 1, entityType: 'STAFF', idEntity: 3, fileName: 'carlos-benitez.jpg', fileUrl: `${AVATAR_BASE}Carlos+Benítez`, mimeType: 'image/jpeg', fileSize: 50800, isPrimary: true, isActive: true, createdAt: '2025-01-15T09:10:00' },
    { idFile: 13, idCompany: 1, entityType: 'STAFF', idEntity: 4, fileName: 'laura-valdez.jpg', fileUrl: `${AVATAR_BASE}Laura+Valdez`, mimeType: 'image/jpeg', fileSize: 48900, isPrimary: true, isActive: true, createdAt: '2025-01-15T09:15:00' },
    { idFile: 14, idCompany: 1, entityType: 'STAFF', idEntity: 5, fileName: 'ana-gimenez.jpg', fileUrl: `${AVATAR_BASE}Ana+Giménez`, mimeType: 'image/jpeg', fileSize: 51600, isPrimary: true, isActive: true, createdAt: '2025-01-15T09:20:00' }
];
