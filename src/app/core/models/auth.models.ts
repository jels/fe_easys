// src/app/core/models/auth.models.ts

/**
 *  Request para login
 */
export interface LoginRequest {
    username: string;
    password: string;
}

/**
 *  Estructura completa de respuesta del login
 */
export interface LoginResponse
    extends ApiResponse<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: number;
        user: BackendUser;
    }> {}

/**
 *  Estructura del usuario en el frontend
 */
export interface UserInfo {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[]; // ⚠️ Plural, como array
}

/**
 *  Request para refresh token
 */
export interface RefreshTokenRequest {
    refreshToken: string;
}

/**
 *  Response del refresh token
 */
export interface RefreshTokenResponse
    extends ApiResponse<{
        accessToken: string;
        tokenType: string;
        expiresIn: number;
    }> {}

/**
 *  Request para registro
 */
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username?: string;
}

/**
 * Response genérico de la API
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    timestamp: string;
    path: string;
}

/**
 *  Estructura del payload del JWT decodificado
 */
export interface JwtPayload {
    sub?: string; // Subject (normalmente el email o ID)
    userId?: number; // ID del usuario
    id?: number; // ID alternativo
    email?: string; // Email del usuario
    firstName?: string; // Nombre
    lastName?: string; // Apellido
    given_name?: string; // Nombre alternativo
    family_name?: string; // Apellido alternativo
    roles?: string[]; // Roles como array
    authorities?: string[]; // Authorities (similar a roles)
    role?: string; // Role como string
    exp?: number; // Expiration timestamp
    iat?: number; // Issued at timestamp
    [key: string]: any; // Otros campos posibles
}

/**
 *  Estructura del usuario que devuelve el backend
 */
export interface BackendUser {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    roles: Roles[]; // ⚠️ Plural, como array
}

/**
 *  Estructura del usuario que devuelve el backend
 */
export interface Roles {
    idRole: number;
    code: string;
    name: string; // ⚠️ Singular, como string
}
