// // src/app/core/guards/device.guard.ts
// import { Injectable } from '@angular/core';
// import {
//   CanActivate,
//   ActivatedRouteSnapshot,
//   RouterStateSnapshot,
//   Router,
//   UrlTree,
// } from '@angular/router';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class DeviceGuard implements CanActivate {
//   constructor(
//     private deviceDetector: DeviceDetectorService,
//     private router: Router,
//   ) {}

//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot,
//   ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     const expectedDevice = route.data['device'] as 'mobile' | 'web';

//     if (!expectedDevice) {
//       // Si no hay dispositivo especificado, permitir acceso
//       return true;
//     }

//     const isMobile = this.deviceDetector.isMobile();
//     const isTablet = this.deviceDetector.isTablet();
//     const isMobileDevice = isMobile || isTablet;

//     // Verificar coincidencia
//     if (expectedDevice === 'mobile' && isMobileDevice) {
//       return true;
//     }

//     if (expectedDevice === 'web' && !isMobileDevice) {
//       return true;
//     }

//     // Redirigir a la ruta apropiada según el dispositivo
//     console.log(
//       `Device mismatch. Expected: ${expectedDevice}, Got: ${isMobileDevice ? 'mobile' : 'web'}`,
//     );

//     // Extraer el nombre de la ruta base
//     const pathSegments = state.url.split('/').filter((s) => s);
//     const baseRoute = pathSegments[0] || 'dashboard';

//     if (isMobileDevice) {
//       // Redirigir a versión móvil
//       return this.router.createUrlTree([`/${baseRoute}/mobile`]);
//     } else {
//       // Redirigir a versión web
//       return this.router.createUrlTree([`/${baseRoute}/web`]);
//     }
//   }
// }
