import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationData {
  mensaje: string;
  imagen?: string;
  tipo?: 'success' | 'error' | 'info' | 'warning';
  duracion?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationData>();
  notification$ = this.notificationSubject.asObservable();

  show(
    mensaje: string,
    imagen?: string,
    tipo: 'success' | 'error' | 'info' | 'warning' = 'info',
    duracion: number = 3000
  ) {
    this.notificationSubject.next({ mensaje, imagen, tipo, duracion });
  }

  success(mensaje: string, imagen?: string, duracion: number = 3000) {
    this.show(mensaje, imagen, 'success', duracion);
  }

  error(mensaje: string, imagen?: string, duracion: number = 3000) {
    this.show(mensaje, imagen, 'error', duracion);
  }

  info(mensaje: string, imagen?: string, duracion: number = 3000) {
    this.show(mensaje, imagen, 'info', duracion);
  }

  warning(mensaje: string, imagen?: string, duracion: number = 3000) {
    this.show(mensaje, imagen, 'warning', duracion);
  }
}
