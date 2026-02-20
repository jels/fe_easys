// src/app/features/auth/services/auth.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, JwtPayload, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, RegisterRequest, UserInfo } from '../../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    public isAuthenticated = signal<boolean>(false);

    private readonly ACCESS_TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly USER_KEY = 'user_info';

    constructor() {
        this.checkStoredAuth();
    }

    private checkStoredAuth(): void {
        const token = this.getAccessToken();
        const user = this.getStoredUser();

        if (token && user && !this.isTokenExpired(token)) {
            this.currentUserSubject.next(user);
            this.isAuthenticated.set(true);
        } else {
            this.clearAuth();
        }
    }

    /**
     * ✅ Login simplificado que coincide con la estructura del backend
     */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${environment.apiUrl}auth/login`, credentials).pipe(
            tap((response) => {
                console.log('📦 Login response:', response);

                if (response.success && response.data) {
                    const { accessToken, refreshToken, user } = response.data;

                    // Validar que tenemos los datos necesarios
                    if (!accessToken || !refreshToken || !user) {
                        throw new Error('Respuesta incompleta del servidor');
                    }

                    // Convertir el user del backend al formato UserInfo del frontend
                    const userInfo: UserInfo = {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        // ⚠️ Convertir role (string) a roles (array)
                        roles: user.roles.map((role) => role.name)
                    };

                    this.setAuthData(accessToken, refreshToken, userInfo);
                    console.log('✅ Login exitoso');
                } else {
                    throw new Error(response.message || 'Error en el login');
                }
            }),
            catchError((error) => {
                console.error('❌ Error en login:', error);
                this.clearAuth();
                return throwError(() => error);
            })
        );
    }

    register(data: RegisterRequest): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${environment.apiUrl}auth/register`, data);
    }

    refreshToken(): Observable<RefreshTokenResponse> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        const request: RefreshTokenRequest = { refreshToken };

        return this.http.post<RefreshTokenResponse>(`${environment.apiUrl}auth/refresh`, request).pipe(
            tap((response) => {
                if (response.success && response.data) {
                    this.setAccessToken(response.data.accessToken);
                }
            }),
            catchError((error) => {
                this.logout();
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
        this.http.post(`${environment.apiUrl}auth/logout`, {}).subscribe((response) => {
            console.log(response);
        });
    }

    private setAuthData(accessToken: string, refreshToken: string, user: UserInfo): void {
        console.log('💾 Guardando datos de autenticación:', {
            user,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken
        });

        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));

        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);

        console.log('✅ Estado de autenticación actualizado');
    }

    private clearAuth(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);

        this.currentUserSubject.next(null);
        this.isAuthenticated.set(false);
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    private setAccessToken(token: string): void {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }

    private getStoredUser(): UserInfo | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    getCurrentUser(): UserInfo | null {
        return this.currentUserSubject.value;
    }

    isTokenExpired(token: string): boolean {
        try {
            const payload = this.decodeToken(token);
            if (!payload || !payload.exp) {
                return true;
            }

            const expirationDate = new Date(payload.exp * 1000);
            return expirationDate <= new Date();
        } catch (error) {
            return true;
        }
    }

    private decodeToken(token: string): JwtPayload | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }

            const payload = parts[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch (error) {
            console.error('❌ Error decodificando token:', error);
            return null;
        }
    }

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.roles?.includes(role) || false;
    }

    hasAnyRole(roles: string[]): boolean {
        const user = this.getCurrentUser();
        if (!user?.roles) {
            return false;
        }
        return roles.some((role) => user.roles.includes(role));
    }

    // En auth.service.ts
    getUserRole(): string | null {
        const user = this.getCurrentUser();
        return user?.roles?.[0] || null;
    }

    getUserRoles(): string[] {
        const user = this.getCurrentUser();
        return user?.roles || [];
    }
}
