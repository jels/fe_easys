import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { FloatingconfiguratorComponent } from '../../layout/floatingconfigurator/floatingconfigurator.component';
import { NotificationService } from '../../shared/components/notification-modal/notification.service';

@Component({
    selector: 'app-forgot',
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, FloatingconfiguratorComponent, FloatLabelModule],
    templateUrl: './forgot.component.html',
    styleUrl: './forgot.component.scss'
})
export class ForgotComponent {
    email: string = '';

    constructor(
        private notifier: NotificationService,
        private router: Router
    ) {}

    sendForgot() {
        this.loginExitoso('Correo enviado con Éxito, verifique su email...', null, 3000);
        this.router.navigate(['auth/login']);
    }

    login() {
        this.loginExitoso('Te recordaste tu contraseña, que bueno!', null, 3000);
        this.router.navigate(['auth/login']);
    }

    loginExitoso(mensaje: string, imagen: string | null, time: number) {
        this.notifier.success(mensaje, imagen!, time);
    }
}
