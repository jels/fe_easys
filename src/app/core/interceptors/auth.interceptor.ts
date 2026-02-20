// src/app/core/interceptors/auth.interceptor.ts

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../core/services/api/auth.service';

/**
 * Interceptor funcional para manejar autenticación JWT
 * Compatible con Angular 20
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // URLs que no requieren token
    const publicUrls = ['/auth/login', '/auth/register', '/users/register', '/auth/refresh'];

    // Si es una URL pública, continuar sin modificar
    const isPublicUrl = publicUrls.some((url) => req.url.includes(url));
    if (isPublicUrl) {
        return next(req);
    }

    // Obtener el access token
    const token = authService.getAccessToken();

    // Si no hay token, continuar sin modificar
    if (!token) {
        return next(req);
    }

    // Clonar la petición y agregar el token
    const clonedReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    // Continuar con la petición y manejar errores
    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Si el error es 401, intentar refrescar el token
            if (error.status === 401 && !req.url.includes('/auth/refresh')) {
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        // Reintentar la petición original con el nuevo token
                        const newToken = authService.getAccessToken();
                        const retryReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`
                            }
                        });
                        return next(retryReq);
                    }),
                    catchError((refreshError) => {
                        // Si falla el refresh, hacer logout
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
