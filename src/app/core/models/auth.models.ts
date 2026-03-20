// src/app/core/models/auth.models.ts

// ── Requests ──────────────────────────────────────────────────────────────────

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ── Respuesta genérica del backend ────────────────────────────────────────────

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    timestamp: string;
}

// ── Estructuras de usuario del backend ───────────────────────────────────────
// Alineadas con AuthResponse.java / UserInfoResponse / RoleInfo

export interface RoleInfo {
    idRole: number;
    name: string; // Java: name (no roleName)
    idCompany: number;
    companyName: string;
    idBranch: number | null;
    branchName: string | null;
}

export interface UserInfoResponse {
    id: number; // Java: id (no idUser)
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean | null;
    roles: RoleInfo[];
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserInfoResponse;
}

// ── Payload JWT decodificado ──────────────────────────────────────────────────

export interface JwtPayload {
    sub?: string;
    userId?: number;
    id?: number;
    email?: string;
    username?: string;
    roles?: string[];
    authorities?: string[];
    exp?: number;
    iat?: number;
    [key: string]: any;
}

// ── Modelo de sesión guardado en localStorage ─────────────────────────────────

export interface SessionData {
    accessToken: string;
    refreshToken: string;
    user: UserInfoResponse;
}
