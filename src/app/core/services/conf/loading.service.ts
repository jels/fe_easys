// src/app/shared/services/loading.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Mostrar loading spinner
   */
  show(): void {
    this.requestCount++;
    if (!this.loadingSubject.value) {
      this.loadingSubject.next(true);
    }
  }

  /**
   * Ocultar loading spinner
   */
  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next(false);
    }
  }

  /**
   * Forzar ocultar (útil para casos especiales)
   */
  forceHide(): void {
    this.requestCount = 0;
    this.loadingSubject.next(false);
  }

  /**
   * Obtener estado actual
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
