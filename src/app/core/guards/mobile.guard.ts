// src/app/core/guards/mobile.guard.ts
// Guard que redirige automáticamente según si es móvil o desktop
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MobileDetectService } from '../services/conf/mobile-detect.service';

export const mobileGuard: CanActivateFn = () => {
    const mobile = inject(MobileDetectService);
    const router = inject(Router);
    if (!mobile.isMobile()) {
        router.navigate(['/sys/home']);
        return false;
    }
    return true;
};

export const desktopGuard: CanActivateFn = () => {
    const mobile = inject(MobileDetectService);
    const router = inject(Router);
    if (mobile.isMobile()) {
        router.navigate(['/mobile']);
        return false;
    }
    return true;
};
