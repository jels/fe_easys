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
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject as RxSubject } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';
import { CredentialData, CredentialPerson, CredentialPersonType, CredentialsService } from '../../core/services/conf/credentials.service';

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
    @ViewChild('credentialRef') credentialRef!: ElementRef<HTMLElement>;

    private search$ = new RxSubject<string>();
    private destroy$ = new Subject<void>();

    constructor(
        private credService: CredentialsService,
        private messageService: MessageService,
        private confirmService: ConfirmationService
    ) {}

    ngOnInit(): void {
        // Búsqueda con debounce
        this.search$.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((q) => this.doSearch(q));

        // Cargar todos al inicio
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
            // Ya tiene token → cargar credencial existente
            this.loadingCred.set(true);
            this.credService
                .getCredential(person)
                .pipe(takeUntil(this.destroy$))
                .subscribe((cd) => {
                    this.credentialData.set(cd);
                    this.loadingCred.set(false);
                });
        }
    }

    // ── Generar / regenerar ───────────────────────────────────────────────────

    generate(): void {
        const person = this.selectedPerson();
        if (!person) return;

        if (person.accessToken) {
            // Regenerar → confirmar porque invalida el token anterior
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
                // Refrescar lista
                this.doSearch(this.searchText);
            });
    }

    // ── Imprimir ──────────────────────────────────────────────────────────────

    print(): void {
        window.print();
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
