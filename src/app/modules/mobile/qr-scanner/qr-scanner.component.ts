// src/app/modules/mobile/qr-scanner/qr-scanner.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { AccessMode } from '../../../shared/data/qr-access.mock';
import { QrAccessService, ScanResult } from '../../../core/services/conf/qr-access.service';

interface ScanFeedback {
    visible: boolean;
    success: boolean;
    name: string;
    grade: string;
    message: string;
    type: string;
    source: 'QR' | 'NFC' | '';
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

    // ── QR Scanner ────────────────────────────────────────────────────────────
    scannerEnabled = signal(true);
    hasCamera = signal(false);
    cameras = signal<MediaDeviceInfo[]>([]);
    selectedCamera = signal<MediaDeviceInfo | undefined>(undefined);
    readonly formats = [BarcodeFormat.QR_CODE];

    // ── NFC ───────────────────────────────────────────────────────────────────
    nfcSupported = typeof (window as any).NDEFReader !== 'undefined';
    nfcActive = signal(false);
    nfcError = signal('');
    private nfcAbort: AbortController | null = null;

    // ── Modo activo de lectura ─────────────────────────────────────────────────
    // 'QR' | 'NFC' — el usuario elige cuál usar
    readMode = signal<'QR' | 'NFC'>('QR');

    // ── Feedback ─────────────────────────────────────────────────────────────
    feedback = signal<ScanFeedback>({
        visible: false,
        success: false,
        name: '',
        grade: '',
        message: '',
        type: '',
        source: ''
    });
    flashActive = signal(false);

    // ── Sesión ────────────────────────────────────────────────────────────────
    scanCount = signal(0);
    scanLog = signal<{ name: string; time: string; success: boolean; source: 'QR' | 'NFC' }[]>([]);

    private feedbackTimer: any;
    private destroy$ = new Subject<void>();

    readonly modeConfig: Record<AccessMode, { label: string; color: string; icon: string }> = {
        ENTRADA: { label: 'Registrar Entrada', color: '#22c55e', icon: '🟢' },
        RETIRO: { label: 'Registrar Retiro', color: '#f59e0b', icon: '🟡' },
        SALIDA: { label: 'Registrar Salida', color: '#ef4444', icon: '🔴' }
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private qrService: QrAccessService
    ) {}

    ngOnInit(): void {
        const modeParam = (this.route.snapshot.paramMap.get('mode') ?? 'entrada').toUpperCase() as AccessMode;
        this.setMode(modeParam);
    }

    ngOnDestroy(): void {
        this.scannerEnabled.set(false);
        this.stopNfc();
        clearTimeout(this.feedbackTimer);
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Modo de acceso (Entrada / Retiro / Salida) ────────────────────────────

    setMode(mode: AccessMode): void {
        this.mode.set(mode);
        this.modeLabel.set(this.modeConfig[mode].label);
        this.modeColor.set(this.modeConfig[mode].color);
    }

    // ── Modo de lectura (QR / NFC) ────────────────────────────────────────────

    switchReadMode(mode: 'QR' | 'NFC'): void {
        if (mode === this.readMode()) return;

        if (mode === 'NFC') {
            this.scannerEnabled.set(false);
            this.readMode.set('NFC');
            this.startNfc();
        } else {
            this.stopNfc();
            this.readMode.set('QR');
            this.scannerEnabled.set(true);
        }
    }

    // ── NFC ───────────────────────────────────────────────────────────────────

    async startNfc(): Promise<void> {
        if (!this.nfcSupported) {
            this.nfcError.set('NFC no disponible en este navegador (requiere Chrome Android)');
            return;
        }

        try {
            this.nfcError.set('');
            this.nfcAbort = new AbortController();

            const ndef = new (window as any).NDEFReader();
            await ndef.scan({ signal: this.nfcAbort.signal });

            this.nfcActive.set(true);

            ndef.addEventListener('reading', ({ message }: any) => {
                const token = this.extractTokenFromNdef(message);
                if (!token) {
                    this.showNfcError('Tag NFC sin datos válidos');
                    return;
                }
                this.processToken(token, 'NFC');
            });

            ndef.addEventListener('readingerror', () => {
                this.showNfcError('No se pudo leer el tag — acercalo nuevamente');
            });
        } catch (err: any) {
            this.nfcActive.set(false);
            if (err.name === 'AbortError') return;

            const msg = err.name === 'NotAllowedError' ? 'Permiso NFC denegado — habilitalo en el navegador' : err.name === 'NotSupportedError' ? 'NFC desactivado en el dispositivo' : 'Error al iniciar NFC: ' + (err.message ?? err.name);

            this.nfcError.set(msg);
        }
    }

    stopNfc(): void {
        this.nfcAbort?.abort();
        this.nfcAbort = null;
        this.nfcActive.set(false);
        this.nfcError.set('');
    }

    private extractTokenFromNdef(message: any): string {
        for (const record of message.records) {
            if (record.recordType === 'text') {
                const decoder = new TextDecoder(record.encoding ?? 'utf-8');
                return decoder.decode(record.data).trim();
            }
            // También soportar URL records (ndef uri)
            if (record.recordType === 'url') {
                const decoder = new TextDecoder();
                const url = decoder.decode(record.data).trim();
                // Extraer token del query param ?token=XXX o del path final
                const match = url.match(/[?&]token=([^&]+)/) ?? url.match(/\/([^/]+)$/);
                if (match) return match[1];
            }
        }
        return '';
    }

    private showNfcError(msg: string): void {
        this.nfcError.set(msg);
        setTimeout(() => this.nfcError.set(''), 3000);
    }

    // ── QR Cámara ────────────────────────────────────────────────────────────

    onCamerasFound(devices: MediaDeviceInfo[]): void {
        this.cameras.set(devices);
        this.hasCamera.set(devices.length > 0);
        const rear = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('trasera'));
        this.selectedCamera.set(rear ?? devices[0] ?? null);
    }

    onCamerasNotFound(): void {
        this.hasCamera.set(false);
    }

    onCodeScanned(token: string): void {
        if (!this.scannerEnabled()) return;
        this.processToken(token, 'QR');
    }

    onScanError(error: any): void {
        console.warn('Scan error (ignorado):', error?.message ?? error);
    }

    // ── Procesamiento común QR + NFC ──────────────────────────────────────────

    private processToken(token: string, source: 'QR' | 'NFC'): void {
        this.qrService
            .registerAccess(token, this.mode())
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => this.handleScanResult(result, source));
    }

    private handleScanResult(result: ScanResult, source: 'QR' | 'NFC'): void {
        if (result.isDuplicate) return;

        clearTimeout(this.feedbackTimer);

        this.feedback.set({
            visible: true,
            success: result.success,
            name: result.person?.fullName ?? 'Token desconocido',
            grade: result.person?.displayLabel ?? '',
            message: result.message,
            type: result.person?.personType === 'STAFF' ? 'Personal' : 'Alumno',
            source
        });

        if (result.success && result.person) {
            this.flashActive.set(true);
            setTimeout(() => this.flashActive.set(false), 600);

            this.scanCount.update((c) => c + 1);
            this.scanLog.update((log) =>
                [
                    {
                        name: result.person!.fullName,
                        time: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        success: true,
                        source
                    },
                    ...log
                ].slice(0, 20)
            );
        }

        this.feedbackTimer = setTimeout(() => {
            this.feedback.update((f) => ({ ...f, visible: false }));
        }, 2500);
    }

    // ── Navegación ────────────────────────────────────────────────────────────

    finalize(): void {
        this.scannerEnabled.set(false);
        this.stopNfc();
        this.router.navigate(['/mobile']);
    }

    get currentConfig() {
        return this.modeConfig[this.mode()];
    }
}
