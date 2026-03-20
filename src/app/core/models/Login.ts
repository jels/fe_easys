// src/app/core/models/Login.ts
// Modelo legacy — se mantiene para compatibilidad con código existente
// Los nuevos módulos deben usar SessionData de auth.models.ts

import { RoleInfo } from './auth.models';

export interface Login {
    // Campos legacy
    token: string;
    username: string;
    type: number;
    password?: string;

    // Campos nuevos del backend
    refreshToken?: string;
    email?: string;
    isSuperAdmin?: boolean;
    roles?: RoleInfo[];
}
