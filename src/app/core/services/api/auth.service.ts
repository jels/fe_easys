// src/app/core/services/api/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LoginRequest, ChangePasswordRequest, ApiResponse, AuthResponse, SessionData, UserInfoResponse, RoleInfo, JwtPayload } from '../../models/auth.models';

// ── Claves de localStorage ────────────────────────────────────────────────────
// Deben coincidir exactamente con lo que leen el interceptor y el guard
const KEY_ACCESS_TOKEN = 'access_token'; // authGuard    → localStorage.getItem('access_token')
const KEY_REFRESH_TOKEN = 'refresh_token';
const KEY_USER_INFO = 'user_info'; // roleGuard    → localStorage.getItem('user_info')

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API = `${environment.apiUrl}auth`;

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    // ── HTTP calls ────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/auth/login
     * Guarda access_token, refresh_token y user_info en localStorage.
     */
    login(username: string, password: string): Observable<ApiResponse<AuthResponse>> {
        const body: LoginRequest = { username, password };
        return this.http.post<ApiResponse<AuthResponse>>(`${this.API}/login`, body).pipe(
            tap((res) => {
                if (res.success && res.data) {
                    this.storeSession(res.data);
                }
            }),
            catchError((err) => throwError(() => err))
        );
    }

    /**
     * POST /api/v1/auth/refresh
     * El interceptor llama esto automáticamente ante un 401.
     */
    refreshToken(): Observable<ApiResponse<AuthResponse>> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return throwError(() => new Error('No hay refresh token'));
        }
        return this.http.post<ApiResponse<AuthResponse>>(`${this.API}/refresh`, { refreshToken }).pipe(
            tap((res) => {
                if (res.success && res.data) {
                    this.storeSession(res.data);
                }
            }),
            catchError((err) => throwError(() => err))
        );
    }

    /**
     * POST /api/v1/auth/change-password
     */
    changePassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.API}/change-password`, request).pipe(catchError((err) => throwError(() => err)));
    }

    /**
     * POST /api/v1/auth/logout
     * Limpia localStorage y redirige al login.
     */
    logout(): void {
        this.http.post<ApiResponse<void>>(`${this.API}/logout`, {}).subscribe({ error: () => {} }); // fire & forget — limpiar igual si falla
        this.clearSession();
        this.router.navigate(['/auth/login']);
    }

    // ── Session storage ───────────────────────────────────────────────────────

    private storeSession(data: AuthResponse): void {
        // ── access_token: backend devuelve "accessToken" (no "token") ─────────
        localStorage.setItem(KEY_ACCESS_TOKEN, data.accessToken);
        localStorage.setItem(KEY_REFRESH_TOKEN, data.refreshToken);

        // ── user_info ─────────────────────────────────────────────────────────
        // El backend puede devolver roles[] vacío para superAdmin.
        // En ese caso extraemos idCompany del JWT payload directamente.
        const jwtPayload = this.decodeToken(data.accessToken);
        // const idCompanyFromJwt: number | undefined =
        //     (jwtPayload?.idCompany as number | undefined) ??
        //     (jwtPayload?.companyId as number | undefined);

        const userInfo = {
            ...data.user,
            roles: data.user.roles ?? [],
            // idCompany auxiliar: roles[0] > JWT > fallback 1 (superAdmin)
            idCompany: data.user.roles?.[0]?.idCompany ?? 1
        };
        localStorage.setItem(KEY_USER_INFO, JSON.stringify(userInfo));
    }

    private clearSession(): void {
        localStorage.removeItem(KEY_ACCESS_TOKEN);
        localStorage.removeItem(KEY_REFRESH_TOKEN);
        localStorage.removeItem(KEY_USER_INFO);
    }

    // ── Getters usados por interceptor, guard y componentes ───────────────────

    /**
     * Usado por el interceptor → authService.getAccessToken()
     */
    getAccessToken(): string | null {
        return localStorage.getItem(KEY_ACCESS_TOKEN);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(KEY_REFRESH_TOKEN);
    }

    getUserInfo(): UserInfoResponse | null {
        const stored = localStorage.getItem(KEY_USER_INFO);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }

    // ── Token utils (usados por authGuard / noAuthGuard) ──────────────────────

    /**
     * Decodifica el payload del JWT sin librerías externas.
     */
    decodeToken(token: string): JwtPayload | null {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        } catch {
            return null;
        }
    }

    /**
     * Usado por authGuard → authService.isTokenExpired(token)
     */
    isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded?.exp) return true;
        // exp en segundos → comparar con Date.now() en ms
        return decoded.exp * 1000 < Date.now();
    }

    // ── Getters de conveniencia ───────────────────────────────────────────────

    isLoggedIn(): boolean {
        const token = this.getAccessToken();
        return !!token && !this.isTokenExpired(token);
    }

    get username(): string | null {
        return this.getUserInfo()?.username ?? null;
    }

    get email(): string | null {
        return this.getUserInfo()?.email ?? null;
    }

    get isSuperAdmin(): boolean {
        return this.getUserInfo()?.isSuperAdmin ?? false;
    }

    get idUser(): number | null {
        return this.getUserInfo()?.id ?? null; // Java: id (no idUser)
    }

    /** idCompany: lee el campo auxiliar guardado en storeSession */
    get idCompany(): number | null {
        const info = this.getUserInfo() as any;
        if (!info) return null;
        // 1. Campo auxiliar guardado en storeSession (roles[0].idCompany o JWT)
        if (info.idCompany) return info.idCompany as number;
        // 2. Fallback: roles como RoleInfo[]
        if (Array.isArray(info.roles) && info.roles[0]?.idCompany) {
            return info.roles[0].idCompany as number;
        }
        return null;
    }

    /** Roles como string[] — compatibles con roleGuard */
    get roleNames(): string[] {
        return this.getUserInfo()?.roles?.map((r: any) => (typeof r === 'string' ? r : (r.name ?? r.roleName))) ?? [];
    }

    hasRole(role: string): boolean {
        return this.roleNames.some((r) => r.toLowerCase() === role.toLowerCase());
    }

    // ── Alias legacy (compatibilidad con código existente) ────────────────────

    /** @deprecated usar getAccessToken() */
    get token(): string | null {
        return this.getAccessToken();
    }

    /** @deprecated usar roleNames */
    get tipo(): number | null {
        return this.isSuperAdmin ? 1 : 0;
    }
}
