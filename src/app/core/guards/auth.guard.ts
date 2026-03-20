// src/app/core/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';

// ── authGuard ─────────────────────────────────────────────────────────────────
// Protege rutas que requieren autenticación.
// Lee 'access_token' de localStorage — misma key que guarda auth.service.ts.

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = localStorage.getItem('access_token');

    if (!token) {
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    if (authService.isTokenExpired(token)) {
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    return true;
};

// ── roleGuard ─────────────────────────────────────────────────────────────────
// Verifica que el usuario tenga al menos uno de los roles requeridos.
// Lee 'user_info' de localStorage — misma key que guarda auth.service.ts.
//
// Uso en rutas:
//   { path: 'admin', canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } }

export const roleGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles?.length) return true;

    const userStr = localStorage.getItem('user_info');
    if (!userStr) {
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    let user: any;
    try {
        user = JSON.parse(userStr);
    } catch {
        router.navigate(['/auth/login']);
        return false;
    }

    if (!user?.roles || !Array.isArray(user.roles)) {
        router.navigate(['/auth/login']);
        return false;
    }

    // user.roles puede ser string[] (normalizado) o RoleInfo[]
    // En ambos casos extraemos el string de role
    const userRoles: string[] = user.roles.map((r: any) => (typeof r === 'string' ? r : r.roleName).toLowerCase());

    const hasRole = requiredRoles.map((r) => r.toLowerCase()).some((r) => userRoles.includes(r));

    if (!hasRole) {
        router.navigate(['/denied']);
        return false;
    }

    return true;
};

// ── noAuthGuard ───────────────────────────────────────────────────────────────
// Solo para rutas públicas (login).
// Si ya está autenticado, redirige al dashboard.

export const noAuthGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getAccessToken();

    if (token && !authService.isTokenExpired(token)) {
        router.navigate(['/sys/dashboard']);
        return false;
    }

    return true;
};
