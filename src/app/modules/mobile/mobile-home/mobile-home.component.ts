// src/app/modules/mobile/mobile-home/mobile-home.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DaySummary, QrAccessService } from '../../../core/services/conf/qr-access.service';
import { AccessMode } from '../../../shared/data/qr-access.mock';

@Component({
    selector: 'app-mobile-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mobile-home.component.html',
    styleUrl: './mobile-home.component.scss'
})
export class MobileHomeComponent implements OnInit, OnDestroy {
    summary = signal<DaySummary | null>(null);
    loading = signal(true);
    userName = signal('');
    currentTime = signal('');
    private timeInterval: any;
    private destroy$ = new Subject<void>();

    readonly modes: { mode: AccessMode; label: string; icon: string; color: string; bg: string }[] = [
        { mode: 'ENTRADA', label: 'Registrar Entrada', icon: '🟢', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
        { mode: 'RETIRO', label: 'Registrar Retiro', icon: '🟡', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        { mode: 'SALIDA', label: 'Registrar Salida', icon: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
    ];

    constructor(
        private router: Router,
        private qrService: QrAccessService
    ) {}

    ngOnInit(): void {
        this.updateTime();
        this.timeInterval = setInterval(() => this.updateTime(), 1000);
        this.loadSummary();

        // Obtener nombre del usuario logueado (del sessionStorage/localStorage)
        const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (stored) {
            try {
                this.userName.set(JSON.parse(stored)?.name ?? '');
            } catch {}
        }
    }

    ngOnDestroy(): void {
        clearInterval(this.timeInterval);
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadSummary(): void {
        this.loading.set(true);
        this.qrService
            .getDaySummary()
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => {
                this.summary.set(s);
                this.loading.set(false);
            });
    }

    openScanner(mode: AccessMode): void {
        this.router.navigate(['/mobile/scanner', mode.toLowerCase()]);
    }

    logout(): void {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
    }

    private updateTime(): void {
        const now = new Date();
        this.currentTime.set(
            now.toLocaleTimeString('es-PY', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        );
    }

    get dateLabel(): string {
        return new Date().toLocaleDateString('es-PY', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }

    get turno(): string {
        const h = new Date().getHours();
        if (h < 12) return 'Mañana';
        if (h < 18) return 'Tarde';
        return 'Noche';
    }
}
