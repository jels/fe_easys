// src/app/core/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/api/auth.service';

/**
 * Guard funcional para proteger rutas que requieren autenticación
 * Compatible con Angular 20
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 🔥 Leer DIRECTAMENTE de localStorage
    const token = localStorage.getItem('access_token');

    console.log('🔐 AuthGuard check:', {
        url: state.url,
        hasToken: !!token,
        tokenPreview: token?.substring(0, 20) + '...'
    });

    if (!token) {
        console.warn('❌ No token found');
        router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
        });
        return false;
    }

    // Verificar expiración
    if (authService.isTokenExpired(token)) {
        console.warn('❌ Token expired');
        router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
        });
        return false;
    }

    console.log('✅ Auth guard passed');
    return true;
};

/**
 * Guard para verificar roles específicos
 * 🔥 Lee DIRECTAMENTE de localStorage para evitar race conditions
 */
export const roleGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
        console.log('⚠️ No roles required, allowing access');
        return true;
    }

    // 🔥 Leer DIRECTAMENTE de localStorage (evita race conditions)
    const userStr = localStorage.getItem('user_info');

    if (!userStr) {
        console.error('❌ No user_info in localStorage');
        router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
        });
        return false;
    }

    let user;
    try {
        user = JSON.parse(userStr);
    } catch (error) {
        console.error('❌ Error parsing user_info:', error);
        router.navigate(['/auth/login']);
        return false;
    }

    if (!user || !user.roles || !Array.isArray(user.roles)) {
        console.error('❌ Invalid user data or roles:', user);
        router.navigate(['/auth/login']);
        return false;
    }

    // Normalizar roles del usuario (quitar prefijos y convertir a minúsculas)
    const userRoles = user.roles.map((role: string) => role.toLowerCase());

    // Normalizar roles requeridos
    const normalizedRequiredRoles = requiredRoles.map((role) => role.toLowerCase());

    const hasRole = normalizedRequiredRoles.some((role) => userRoles.includes(role));

    console.log('🔐 RoleGuard:', {
        url: state.url,
        required: normalizedRequiredRoles,
        userHas: userRoles,
        rawUserRoles: user.roles,
        hasAccess: hasRole
    });

    if (!hasRole) {
        console.warn('❌ Access denied - insufficient permissions');
        router.navigate(['/denied']);
        return false;
    }

    console.log('✅ Role check passed');
    return true;
};

/**
 * Guard para rutas que solo deben ser accesibles sin autenticación
 * (Como login, si ya está autenticado, redirigir al dashboard)
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getAccessToken();

    console.log('🔓 NoAuthGuard check:', {
        url: state.url,
        hasToken: !!token
    });

    if (token && !authService.isTokenExpired(token)) {
        // Si ya está autenticado, redirigir al dashboard
        console.log('✅ User already authenticated, redirecting to /dd/cl');
        router.navigate(['/sys/dashboard']);
        return false;
    }

    console.log('✅ NoAuth guard passed');
    return true;
};
