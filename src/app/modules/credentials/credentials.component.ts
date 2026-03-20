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

// Services
import { CredentialsService, CredentialPersonType } from '../../core/services/api/credentials.service';
import { StudentsService } from '../../core/services/api/students.service';
import { StaffService } from '../../core/services/api/staff.service';
import { AuthService } from '../../core/services/api/auth.service';

// Models
import { QrCodeResponse, GenerateQrRequest } from '../../core/models/qr.models';
import { StaffResponse } from '../../core/models/staff.models';
import { StudentResponse } from '../../core/models/student.dto';

// ── Tipos locales que reemplazan los mocks ────────────────────────────────────

export interface CredentialPerson {
    idPerson: number;
    personType: CredentialPersonType;
    fullName: string;
    displayLabel: string;
    photoUrl?: string | null;
    accessToken?: string | null; // null = sin credencial
    credentialIssuedAt?: string | null;
}

export interface CredentialData {
    accessToken: string;
    institution: string;
    activeYear: string;
    isNew: boolean;
    person: {
        fullName: string;
        displayLabel: string;
        photoUrl?: string | null;
        credentialIssuedAt?: string | null;
    };
}

// ─────────────────────────────────────────────────────────────────────────────

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

    private search$ = new Subject<string>();
    private destroy$ = new Subject<void>();

    // Cache de alumnos y personal para búsqueda local
    private allStudents: CredentialPerson[] = [];
    private allStaff: CredentialPerson[] = [];

    // Nombre de institución y año activo — se obtienen del AuthService / backend
    private institution = 'Institución';
    private activeYear = '';

    constructor(
        private credService: CredentialsService,
        private studentsService: StudentsService,
        private staffService: StaffService,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.search$.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((q) => this.doSearch(q));

        this.loadPersonCache();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Carga de personas al iniciar (para búsqueda) ──────────────────────────

    private loadPersonCache(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loadingSearch.set(true);

        // Cargar alumnos
        this.studentsService
            .getAll(idCompany, { size: 500 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.allStudents = (res.data?.content ?? []).map((s) => this.studentToCredPerson(s));
                    }
                    this.doSearch('');
                }
            });

        // Cargar personal
        this.staffService
            .getAll(idCompany, { size: 200 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.allStaff = (res.data?.content ?? []).map((s) => this.staffToCredPerson(s));
                    }
                    this.doSearch('');
                }
            });
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
        const term = q.toLowerCase().trim();

        let pool: CredentialPerson[] = [];
        if (this.personType === 'ALL' || this.personType === 'STUDENT') {
            pool = pool.concat(this.allStudents);
        }
        if (this.personType === 'ALL' || this.personType === 'STAFF') {
            pool = pool.concat(this.allStaff);
        }

        const filtered = term ? pool.filter((p) => p.fullName.toLowerCase().includes(term) || p.displayLabel.toLowerCase().includes(term)) : pool;

        this.searchResults.set(filtered);
        this.loadingSearch.set(false);
    }

    // ── Selección ─────────────────────────────────────────────────────────────

    selectPerson(person: CredentialPerson): void {
        this.selectedPerson.set(person);
        this.credentialData.set(null);
        this.printReady.set(false);

        if (person.accessToken) {
            this.loadingCred.set(true);
            this.credService
                .getCredential(person.personType, person.idPerson)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        if (res.success && res.data) {
                            this.credentialData.set(this.qrToCredData(res.data, false));
                            this.printReady.set(true);
                        }
                        this.loadingCred.set(false);
                    },
                    error: () => this.loadingCred.set(false)
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
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        this.generatingCred.set(true);

        const req: GenerateQrRequest = {
            idCompany,
            personType: person.personType,
            idPerson: person.idPerson
        };

        this.credService
            .generateCredential(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        const cd = this.qrToCredData(res.data, true);
                        this.credentialData.set(cd);
                        this.selectedPerson.update((p) => (p ? { ...p, accessToken: res.data!.token, credentialIssuedAt: res.data!.issuedAt } : p));
                        this.printReady.set(true);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Credencial generada',
                            detail: `Token: ${res.data.token}`
                        });
                        // Actualizar cache
                        this.updatePersonInCache(person.idPerson, person.personType, res.data.token, res.data.issuedAt);
                        this.doSearch(this.searchText);
                    }
                    this.generatingCred.set(false);
                },
                error: () => this.generatingCred.set(false)
            });
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private studentToCredPerson(s: StudentResponse): CredentialPerson {
        return {
            idPerson: s.idStudent,
            personType: 'STUDENT',
            fullName: s.person.fullName,
            displayLabel: `${s.gradeName ?? ''} ${s.sectionName ?? ''}`.trim() || s.enrollmentNumber,
            photoUrl: s.photoUrl ?? null,
            accessToken: null,
            credentialIssuedAt: null
        };
    }

    private staffToCredPerson(s: StaffResponse): CredentialPerson {
        return {
            idPerson: s.idStaff,
            personType: 'STAFF',
            fullName: s.person.fullName,
            displayLabel: s.position ?? s.staffType ?? '',
            photoUrl: null,
            accessToken: null,
            credentialIssuedAt: null
        };
    }

    private qrToCredData(qr: QrCodeResponse, isNew: boolean): CredentialData {
        return {
            accessToken: qr.token,
            institution: this.institution,
            activeYear: this.activeYear,
            isNew,
            person: {
                fullName: qr.fullName ?? '',
                displayLabel: qr.displayLabel ?? '',
                photoUrl: qr.photoUrl ?? null,
                credentialIssuedAt: qr.issuedAt
            }
        };
    }

    private updatePersonInCache(idPerson: number, type: CredentialPersonType, token: string, issuedAt: string): void {
        if (type === 'STUDENT') {
            this.allStudents = this.allStudents.map((p) => (p.idPerson === idPerson ? { ...p, accessToken: token, credentialIssuedAt: issuedAt } : p));
        } else {
            this.allStaff = this.allStaff.map((p) => (p.idPerson === idPerson ? { ...p, accessToken: token, credentialIssuedAt: issuedAt } : p));
        }
    }

    // ── Impresión ─────────────────────────────────────────────────────────────

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
            const W = cardEl.offsetWidth;
            const H = cardEl.offsetHeight;
            const SCALE = 4;

            const out = document.createElement('canvas');
            out.width = W * SCALE;
            out.height = H * SCALE;
            const ctx = out.getContext('2d')!;
            ctx.scale(SCALE, SCALE);

            const bgImg = await this.loadImage('/assets/img/Credenciales.png');
            ctx.drawImage(bgImg, 0, 0, W, H);

            const photoEl = cardEl.querySelector('.cred-photo-circle img') as HTMLImageElement | null;
            if (photoEl?.complete && photoEl.naturalWidth > 0) {
                const rect = photoEl.getBoundingClientRect();
                const card = cardEl.getBoundingClientRect();
                const px = rect.left - card.left,
                    py = rect.top - card.top;
                const pw = rect.width,
                    ph = rect.height;
                ctx.save();
                ctx.beginPath();
                ctx.arc(px + pw / 2, py + ph / 2, pw / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(photoEl, px, py, pw, ph);
                ctx.restore();
            }

            const initialsEl = cardEl.querySelector('.cred-initials') as HTMLElement | null;
            if (initialsEl) {
                const rect = cardEl.querySelector('.cred-photo-circle')!.getBoundingClientRect();
                const card = cardEl.getBoundingClientRect();
                const px = rect.left - card.left,
                    py = rect.top - card.top;
                const pw = rect.width,
                    ph = rect.height;
                ctx.save();
                ctx.beginPath();
                ctx.arc(px + pw / 2, py + ph / 2, pw / 2, 0, Math.PI * 2);
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

            const drawText = (sel: string, size: number, weight: string, color: string) => {
                const el = cardEl.querySelector(sel) as HTMLElement | null;
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const card = cardEl.getBoundingClientRect();
                ctx.fillStyle = color;
                ctx.font = `${weight} ${size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(el.textContent?.trim() ?? '', rect.left - card.left + rect.width / 2, rect.top - card.top + rect.height / 2, rect.width);
            };
            drawText('.cred-institution', 12, '700', '#ffffff');
            drawText('.cred-value-name', 13, '800', '#001b40');
            drawText('.cred-value-grade', 10.5, '800', '#001b40');
            drawText('.cred-value-year', 10, '600', '#333333');

            const qrCanvas = cardEl.querySelector('canvas') as HTMLCanvasElement | null;
            if (qrCanvas) {
                const qrRect = qrCanvas.closest('.cred-qr-wrap')?.getBoundingClientRect() ?? qrCanvas.getBoundingClientRect();
                const card = cardEl.getBoundingClientRect();
                const qx = qrRect.left - card.left,
                    qy = qrRect.top - card.top;
                const qw = qrRect.width,
                    qh = qrRect.height;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(qx, qy, qw, qh);
                ctx.drawImage(qrCanvas, qx, qy, qw, qh);
            }

            const imgDataUrl = out.toDataURL('image/png', 1.0);
            const printWin = window.open('', '_blank', 'width=900,height=600');
            if (!printWin) {
                this.messageService.add({ severity: 'warn', summary: 'Popups bloqueados', detail: 'Habilitá los popups para esta página e intentá de nuevo' });
                return;
            }
            printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Carnet</title>
<style>*{margin:0;padding:0;box-sizing:border-box}@page{size:8.6cm 5.4cm landscape;margin:0}
html,body{width:8.6cm;height:5.4cm;overflow:hidden;background:white}
img{display:block;width:8.6cm;height:5.4cm;image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges;-webkit-print-color-adjust:exact;print-color-adjust:exact}
</style></head><body><img src="${imgDataUrl}"/>
<script>window.onload=function(){setTimeout(function(){window.print();window.onafterprint=function(){window.close()};setTimeout(function(){window.close()},2000)},300)}<\/script>
</body></html>`);
            printWin.document.close();
        } catch (err) {
            console.error('Error al capturar carnet:', err);
            this.messageService.add({ severity: 'error', summary: 'Error al imprimir', detail: 'No se pudo capturar el carnet. Intentá de nuevo.' });
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
