// src/app/core/interceptors/auth.interceptor.ts
// ✅ Sin modificaciones — funciona correctamente con el nuevo auth.service.ts
//    authService.getAccessToken() → lee 'access_token' de localStorage
//    authService.refreshToken()   → POST /api/v1/auth/refresh
//    authService.logout()         → limpia sesión y redirige

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/api/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // URLs que no requieren token
    const publicUrls = ['/auth/login', '/auth/register', '/auth/refresh'];

    const isPublicUrl = publicUrls.some((url) => req.url.includes(url));
    if (isPublicUrl) {
        return next(req);
    }

    const token = authService.getAccessToken();

    if (!token) {
        return next(req);
    }

    const clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !req.url.includes('/auth/refresh')) {
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        const newToken = authService.getAccessToken();
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` }
                        });
                        return next(retryReq);
                    }),
                    catchError((refreshError) => {
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
