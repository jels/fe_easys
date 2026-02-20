// src/app/modules/mobile/qr-scanner/qr-scanner.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QrAccessService, ScanResult } from '../../../core/services/conf/qr-access.service';
import { AccessMode } from '../../../shared/data/qr-access.mock';

interface ScanFeedback {
    visible: boolean;
    success: boolean;
    name: string;
    grade: string;
    message: string;
    type: string;
}

@Component({
    selector: 'app-qr-scanner',
    standalone: true,
    imports: [CommonModule, ZXingScannerModule],
    templateUrl: './qr-scanner.component.html',
    styleUrl: './qr-scanner.component.scss'
})
export class QrScannerComponent implements OnInit, OnDestroy {
    mode = signal<AccessMode>('ENTRADA');
    modeLabel = signal('Registrar Entrada');
    modeColor = signal('#22c55e');

    // Scanner
    scannerEnabled = signal(true);
    hasCamera = signal(false);
    cameras = signal<MediaDeviceInfo[]>([]);
    selectedCamera = signal<MediaDeviceInfo | undefined>(undefined);
    readonly formats = [BarcodeFormat.QR_CODE];

    // Feedback
    feedback = signal<ScanFeedback>({
        visible: false,
        success: false,
        name: '',
        grade: '',
        message: '',
        type: ''
    });
    flashActive = signal(false);

    // Contador de sesión
    scanCount = signal(0);
    scanLog = signal<{ name: string; time: string; success: boolean }[]>([]);

    private feedbackTimer: any;
    private destroy$ = new Subject<void>();

    readonly modeConfig: Record<AccessMode, { label: string; color: string; icon: string; bg: string }> = {
        ENTRADA: { label: 'Registrar Entrada', color: '#22c55e', icon: '🟢', bg: '#052e16' },
        RETIRO: { label: 'Registrar Retiro', color: '#f59e0b', icon: '🟡', bg: '#1c1004' },
        SALIDA: { label: 'Registrar Salida', color: '#ef4444', icon: '🔴', bg: '#2d0a0a' }
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private qrService: QrAccessService
    ) {}

    ngOnInit(): void {
        // Leer modo desde la URL: /mobile/scanner/:mode
        const modeParam = (this.route.snapshot.paramMap.get('mode') ?? 'entrada').toUpperCase() as AccessMode;
        this.setMode(modeParam);
    }

    ngOnDestroy(): void {
        this.scannerEnabled.set(false);
        clearTimeout(this.feedbackTimer);
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Cámara ────────────────────────────────────────────────────────────────

    onCamerasFound(devices: MediaDeviceInfo[]): void {
        this.cameras.set(devices);
        this.hasCamera.set(devices.length > 0);
        // Preferir cámara trasera
        const rear = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('trasera'));
        this.selectedCamera.set(rear ?? devices[0] ?? null);
    }

    onCamerasNotFound(): void {
        this.hasCamera.set(false);
    }

    // ── Escaneo ───────────────────────────────────────────────────────────────

    onCodeScanned(hashCode: string): void {
        if (!this.scannerEnabled()) return;

        this.qrService
            .registerAccess(hashCode, this.mode())
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => this.handleScanResult(result, hashCode));
    }

    private handleScanResult(result: ScanResult, hash: string): void {
        if (result.isDuplicate) return; // silencioso para duplicados inmediatos

        clearTimeout(this.feedbackTimer);

        this.feedback.set({
            visible: true,
            success: result.success,
            name: result.person?.fullName ?? 'QR desconocido',
            grade: result.person?.gradeName ?? (result.person?.personType === 'STAFF' ? 'Personal' : ''),
            message: result.message,
            type: result.person?.personType === 'STAFF' ? 'Personal' : 'Alumno'
        });

        if (result.success && result.person) {
            // Flash verde en pantalla
            this.flashActive.set(true);
            setTimeout(() => this.flashActive.set(false), 600);

            // Agregar al log de sesión
            this.scanCount.update((c) => c + 1);
            this.scanLog.update((log) =>
                [
                    {
                        name: result.person!.fullName,
                        time: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        success: true
                    },
                    ...log
                ].slice(0, 20)
            ); // máximo 20 en pantalla
        }

        // Auto-ocultar feedback después de 2.5s
        this.feedbackTimer = setTimeout(() => {
            this.feedback.update((f) => ({ ...f, visible: false }));
        }, 2500);
    }

    onScanError(error: any): void {
        // Ignorar errores de decodificación (frames sin QR)
        console.warn('Scan error (ignorado):', error?.message ?? error);
    }

    // ── Controles ─────────────────────────────────────────────────────────────

    setMode(mode: AccessMode): void {
        this.mode.set(mode);
        this.modeLabel.set(this.modeConfig[mode].label);
        this.modeColor.set(this.modeConfig[mode].color);
    }

    finalize(): void {
        this.scannerEnabled.set(false);
        this.router.navigate(['/mobile']);
    }

    get currentConfig() {
        return this.modeConfig[this.mode()];
    }
}
