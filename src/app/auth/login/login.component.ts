import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MobileDetectService } from '../../core/services/conf/mobile-detect.service';
import { AuthService } from '../../core/services/api/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading = signal(false);
    error = signal('');
    showPassword = signal(false);

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private mobileDetect: MobileDetectService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    submit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.error.set('');

        const { username, password } = this.loginForm.value;

        this.authService.login(username, password).subscribe({
            next: () => {
                // La sesión ya fue guardada en localStorage por auth.service
                // Redirigir según dispositivo
                if (this.mobileDetect.isMobile()) {
                    this.router.navigate(['/mobile']);
                } else {
                    this.router.navigate(['/sys/home']);
                }
            },
            error: (err: HttpErrorResponse) => {
                this.loading.set(false);
                this.error.set(this.resolveErrorMessage(err));
            }
        });
    }

    togglePassword(): void {
        this.showPassword.update((v) => !v);
    }

    isInvalid(field: string): boolean {
        const c = this.loginForm.get(field);
        return !!(c?.invalid && c.touched);
    }

    get isMobile(): boolean {
        return this.mobileDetect.isMobile();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private resolveErrorMessage(err: HttpErrorResponse): string {
        // Error con respuesta del servidor
        if (err.error?.message) return err.error.message;

        switch (err.status) {
            case 0:
                return 'No se pudo conectar con el servidor. Verificá tu conexión.';
            case 400:
                return 'Datos de acceso inválidos.';
            case 401:
                return 'Usuario o contraseña incorrectos.';
            case 403:
                return 'Tu cuenta no tiene permisos de acceso.';
            case 404:
                return 'Servicio no disponible. Contactá al administrador.';
            case 500:
                return 'Error interno del servidor. Intentá más tarde.';
            default:
                return 'Ocurrió un error inesperado. Intentá nuevamente.';
        }
    }
}
