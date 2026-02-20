// src/app/core/services/mobile-detect.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MobileDetectService {
    private readonly _isMobile = signal(this.detectMobile());

    readonly isMobile = this._isMobile.asReadonly();

    constructor() {
        // Re-evaluar si cambia el tamaño de ventana (orientación, etc.)
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => {
                this._isMobile.set(this.detectMobile());
            });
        }
    }

    private detectMobile(): boolean {
        if (typeof window === 'undefined') return false;

        // 1. User-agent — cubre Android, iOS, Windows Phone
        const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // 2. Viewport — cubre tablets en orientación portrait o pantallas pequeñas
        const viewportMobile = window.innerWidth <= 768;

        // 3. Touch — dispositivos táctiles
        const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        return uaMobile || (viewportMobile && touchDevice);
    }

    /** Forzar modo mobile (útil para testing en desktop) */
    forceMobile(value: boolean): void {
        this._isMobile.set(value);
    }
}
