import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationData } from './notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-modal',
  imports: [CommonModule],
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss'],
})
export class NotificationModalComponent implements OnInit, OnDestroy {
  visible = false;
  animateOut = false;
  mensaje = '';
  imagen?: string;
  tipo: 'success' | 'error' | 'info' | 'warning' = 'info';
  private timeoutId: any;
  private sub!: Subscription;

  constructor(private notifier: NotificationService) {}

  ngOnInit() {
    console.log('ConfirmationModalComponent inicializado');

    this.sub = this.notifier.notification$.subscribe(
      (data: NotificationData) => {
        clearTimeout(this.timeoutId);
        this.animateOut = false;
        this.visible = true;
        this.mensaje = data.mensaje;
        this.imagen = data.imagen;
        this.tipo = data.tipo || 'info';

        this.timeoutId = setTimeout(() => {
          this.animateOut = true;
          setTimeout(() => (this.visible = false), 500); // esperar animación
        }, data.duracion || 3000);
      },
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    clearTimeout(this.timeoutId);
  }
}

//Forma de Uso del modal...

// Se llama al modal desde el ts donde quiera usar pero este codigo se puede colocar en la clase root por ejemplo en el app.component.html
// <app-notification-modal></app-notification-modal>

//En el ts seria, se crea la variable

//Agregar en el constructor la siguiente linea
//    private notifier: NotificationService

//en vez del success se puede cambiar por las opciones 'success' | 'error' | 'info' | 'warning' = 'info' y predeterminado va el info
//loginExitoso(mensaje: string, imagen: string | null, time: number) {
//   this.notifier.success(mensaje, imagen!, time);
// }

//con esta linea se le llama al metodo enviando los parametros necesarios, teniendo en cuenta que la imagen puede ser null
//this.loginExitoso('¡Bienvenido!', 'assets/check.gif', 3000);
