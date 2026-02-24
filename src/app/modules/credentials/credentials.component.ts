// src/app/modules/credentials/credentials.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { QRCodeComponent } from 'angularx-qrcode';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject as RxSubject } from 'rxjs';

import { CredentialsService, CredentialPerson, CredentialData, CredentialPersonType } from '../../core/services/conf/credentials.service';

@Component({
    selector: 'app-credentials',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SelectButtonModule, SkeletonModule, TagModule, TooltipModule, ToastModule, ConfirmDialogModule, QRCodeComponent],
    templateUrl: './credentials.component.html',
    styleUrl: './credentials.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class CredentialsComponent implements OnInit, OnDestroy {
    // ── Búsqueda ──────────────────────────────────────────────────────────────
    searchText = '';
    personType: CredentialPersonType | 'ALL' = 'ALL';
    searchResults = signal<CredentialPerson[]>([]);
    loadingSearch = signal(false);

    readonly typeOptions = [
        { label: 'Todos', value: 'ALL' },
        { label: 'Alumnos', value: 'STUDENT' },
        { label: 'Personal', value: 'STAFF' }
    ];

    // ── Credencial seleccionada ───────────────────────────────────────────────
    selectedPerson = signal<CredentialPerson | null>(null);
    credentialData = signal<CredentialData | null>(null);
    loadingCred = signal(false);
    generatingCred = signal(false);

    // ── Print ─────────────────────────────────────────────────────────────────
    printReady = signal(false);
    printLoading = signal(false);

    @ViewChild('credentialRef') credentialRef!: ElementRef<HTMLElement>;

    private search$ = new RxSubject<string>();
    private destroy$ = new Subject<void>();

    constructor(
        private credService: CredentialsService,
        private messageService: MessageService,
        private confirmService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.search$.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((q) => this.doSearch(q));

        this.doSearch('');
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Búsqueda ──────────────────────────────────────────────────────────────

    onSearchInput(): void {
        this.search$.next(this.searchText);
    }
    onTypeChange(): void {
        this.doSearch(this.searchText);
    }

    private doSearch(q: string): void {
        this.loadingSearch.set(true);
        this.credService
            .search(q, this.personType)
            .pipe(takeUntil(this.destroy$))
            .subscribe((r) => {
                this.searchResults.set(r);
                this.loadingSearch.set(false);
            });
    }

    // ── Selección ─────────────────────────────────────────────────────────────

    selectPerson(person: CredentialPerson): void {
        this.selectedPerson.set(person);
        this.credentialData.set(null);
        this.printReady.set(false);

        if (person.accessToken) {
            this.loadingCred.set(true);
            this.credService
                .getCredential(person)
                .pipe(takeUntil(this.destroy$))
                .subscribe((cd) => {
                    this.credentialData.set(cd);
                    this.loadingCred.set(false);
                    this.printReady.set(!!cd);
                });
        }
    }

    // ── Generar / regenerar ───────────────────────────────────────────────────

    generate(): void {
        const person = this.selectedPerson();
        if (!person) return;

        if (person.accessToken) {
            this.confirmService.confirm({
                message: `Regenerar el carnet de <strong>${person.fullName}</strong> invalidará el QR anterior. ¿Continuás?`,
                header: 'Regenerar credencial',
                icon: 'pi pi-exclamation-triangle',
                accept: () => this.doGenerate(person)
            });
        } else {
            this.doGenerate(person);
        }
    }

    private doGenerate(person: CredentialPerson): void {
        this.generatingCred.set(true);
        this.credService
            .generateCredential(person)
            .pipe(takeUntil(this.destroy$))
            .subscribe((cd) => {
                this.credentialData.set(cd);
                this.selectedPerson.update((p) => (p ? { ...p, accessToken: cd.accessToken, credentialIssuedAt: cd.person.credentialIssuedAt } : p));
                this.generatingCred.set(false);
                this.printReady.set(true);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Credencial generada',
                    detail: `Token: ${cd.accessToken}`
                });
                this.doSearch(this.searchText);
            });
    }

    // ── Impresión: canvas manual con fondo PNG nítido ────────────────────────
    // html2canvas degrada el background-image CSS. Solución: cargar el PNG
    // manualmente via Image(), dibujarlo en canvas 4x y superponer los datos.

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('No se pudo cargar: ' + src));
            img.src = src;
        });
    }

    async print(): Promise<void> {
        const cardEl = document.getElementById('credential-print-area');
        if (!cardEl) return;

        this.printLoading.set(true);

        try {
            // ── 1. Dimensiones del carnet en pantalla
            const W = cardEl.offsetWidth; // 430px
            const H = cardEl.offsetHeight; // 273px
            const SCALE = 4; // resolución de impresión

            // ── 2. Canvas de salida a 4x
            const out = document.createElement('canvas');
            out.width = W * SCALE;
            out.height = H * SCALE;
            const ctx = out.getContext('2d')!;
            ctx.scale(SCALE, SCALE);

            // ── 3. Dibujar el PNG de fondo en máxima calidad
            const bgImg = await this.loadImage('/assets/img/Credenciales.png');
            ctx.drawImage(bgImg, 0, 0, W, H);

            // ── 4. Superponer la foto circular (si existe)
            const photoEl = cardEl.querySelector('.cred-photo-circle img') as HTMLImageElement | null;
            if (photoEl?.complete && photoEl.naturalWidth > 0) {
                const rect = photoEl.getBoundingClientRect();
                const card = cardEl.getBoundingClientRect();
                const px = rect.left - card.left;
                const py = rect.top - card.top;
                const pw = rect.width;
                const ph = rect.height;
                ctx.save();
                ctx.beginPath();
                ctx.arc(px + pw / 2, py + ph / 2, pw / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(photoEl, px, py, pw, ph);
                ctx.restore();
            }

            // ── 5. Superponer las iniciales si no hay foto
            const initialsEl = cardEl.querySelector('.cred-initials') as HTMLElement | null;
            if (initialsEl) {
                const rect = cardEl.querySelector('.cred-photo-circle')!.getBoundingClientRect();
                const card = cardEl.getBoundingClientRect();
                const px = rect.left - card.left;
                const py = rect.top - card.top;
                const pw = rect.width;
                const ph = rect.height;
                ctx.save();
                ctx.beginPath();
                ctx.arc(px + pw / 2, py + ph / 2, pw / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.fillStyle = 'rgba(0,27,64,0.15)';
                ctx.fillRect(px, py, pw, ph);
                ctx.restore();
                ctx.fillStyle = '#0a4f94';
                ctx.font = `900 ${pw * 0.45}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(initialsEl.textContent?.trim() ?? '', px + pw / 2, py + ph / 2);
            }

            // ── 6. Textos del carnet (nombre, grado, año, institución)
            const drawText = (sel: string, size: number, weight: string, color: string) => {
                const el = cardEl.querySelector(sel) as HTMLElement | null;
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const card = cardEl.getBoundingClientRect();
                const x = rect.left - card.left + rect.width / 2;
                const y = rect.top - card.top + rect.height / 2;
                ctx.fillStyle = color;
                ctx.font = `${weight} ${size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(el.textContent?.trim() ?? '', x, y, rect.width);
            };

            drawText('.cred-institution', 12, '700', '#ffffff');
            drawText('.cred-value-name', 13, '800', '#001b40');
            drawText('.cred-value-grade', 10.5, '800', '#001b40');
            drawText('.cred-value-year', 10, '600', '#333333');

            // ── 7. QR: leer el canvas de angularx-qrcode directamente
            const qrCanvas = cardEl.querySelector('canvas') as HTMLCanvasElement | null;
            if (qrCanvas) {
                const qrRect = qrCanvas.closest('.cred-qr-wrap')?.getBoundingClientRect() ?? qrCanvas.getBoundingClientRect();
                const card = cardEl.getBoundingClientRect();
                const qx = qrRect.left - card.left;
                const qy = qrRect.top - card.top;
                const qw = qrRect.width;
                const qh = qrRect.height;
                // Fondo blanco del área QR
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(qx, qy, qw, qh);
                // QR a máxima calidad (dibujar el canvas directamente)
                ctx.drawImage(qrCanvas, qx, qy, qw, qh);
            }

            const imgDataUrl = out.toDataURL('image/png', 1.0);

            const printWin = window.open('', '_blank', 'width=900,height=600');
            if (!printWin) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Popups bloqueados',
                    detail: 'Habilitá los popups para esta página e intentá de nuevo'
                });
                this.printLoading.set(false);
                return;
            }

            printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Carnet</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: 8.6cm 5.4cm landscape; margin: 0; }
    html, body {
      width: 8.6cm; height: 5.4cm;
      overflow: hidden; background: white;
    }
    img {
      display: block;
      width: 8.6cm; height: 5.4cm;
      /* No usar object-fit: fill — mantener píxeles exactos */
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <img src="${imgDataUrl}" />
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.onafterprint = function() { window.close(); };
        setTimeout(function() { window.close(); }, 2000);
      }, 300);
    };
  <\/script>
</body>
</html>`);
            printWin.document.close();
        } catch (err) {
            console.error('Error al capturar carnet:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Error al imprimir',
                detail: 'No se pudo capturar el carnet. Intentá de nuevo.'
            });
        } finally {
            this.printLoading.set(false);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    hasCredential(person: CredentialPerson): boolean {
        return !!person.accessToken;
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
    }

    getTypeLabel(type: CredentialPersonType): string {
        return type === 'STUDENT' ? 'Alumno' : 'Personal';
    }

    getTypeSeverity(type: CredentialPersonType): 'info' | 'success' {
        return type === 'STUDENT' ? 'info' : 'success';
    }
}
