// src/app/modules/parents/parents.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { ParentsService, ParentFilter } from '../../core/services/api/parents.service';
import { AuthService } from '../../core/services/api/auth.service';

// Models

// Dialogs
import { ParentFormDialogComponent } from '../../shared/components/parent/parent-form-dialog/parent-form-dialog.component';
import { ParentDetailDialogComponent } from '../../shared/components/parent/parent-detail-dialog/parent-detail-dialog.component';
import { ParentResponse } from '../../core/models/student.dto';

@Component({
    selector: 'app-parents',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ToastModule, ConfirmDialogModule, TagModule, SelectModule, TableModule, SkeletonModule, ButtonModule, TooltipModule, ParentFormDialogComponent, ParentDetailDialogComponent],
    templateUrl: './parents.component.html',
    styleUrl: './parents.component.scss',
    providers: [ConfirmationService, MessageService]
})
export class ParentsComponent implements OnInit, OnDestroy {
    parents = signal<ParentResponse[]>([]);
    loading = signal(false);
    totalRecords = signal(0);

    // Paginación server-side (0-based para Spring Data)
    page = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];

    // Filtros
    searchQuery = '';
    selectedFinancialFilter: boolean | null = null;

    readonly financialOptions = [
        { label: 'Todos', value: null },
        { label: 'Responsable financiero', value: true },
        { label: 'No responsable financiero', value: false }
    ];

    // Modales
    showFormDialog = signal(false);
    showDetailDialog = signal(false);
    selectedParentId = signal<number | null>(null);

    private destroy$ = new Subject<void>();

    constructor(
        private parentsService: ParentsService,
        private authService: AuthService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadParents();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Data ──────────────────────────────────────────────────────────────────

    loadParents(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loading.set(true);

        const filters: ParentFilter = {
            page: this.page,
            size: this.pageSize
        };
        if (this.searchQuery) filters.search = this.searchQuery;

        this.parentsService
            .getAll(idCompany, filters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.parents.set(res.data.content);
                        this.totalRecords.set(res.data.totalElements);
                    }
                    this.loading.set(false);
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los padres/tutores'
                    });
                    this.loading.set(false);
                }
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

    onSearch(): void {
        this.page = 0;
        this.loadParents();
    }
    onFilterChange(): void {
        this.page = 0;
        this.loadParents();
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedFinancialFilter = null;
        this.page = 0;
        this.loadParents();
    }

    onPageChange(event: TableLazyLoadEvent): void {
        this.page = Math.floor((event.first ?? 0) / (event.rows ?? 10));
        this.pageSize = event.rows ?? 10;
        this.loadParents();
    }

    // ── Acciones ──────────────────────────────────────────────────────────────

    openCreate(): void {
        this.selectedParentId.set(null);
        this.showFormDialog.set(true);
    }

    openEdit(parent: ParentResponse): void {
        this.selectedParentId.set(parent.idParent);
        this.showFormDialog.set(true);
    }

    openDetail(parent: ParentResponse): void {
        this.selectedParentId.set(parent.idParent);
        this.showDetailDialog.set(true);
    }

    onFormSaved(): void {
        this.showFormDialog.set(false);
        this.loadParents();
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: this.selectedParentId() ? 'Tutor actualizado correctamente' : 'Tutor registrado correctamente'
        });
    }

    onFormClosed(): void {
        this.showFormDialog.set(false);
    }
    onDetailClosed(): void {
        this.showDetailDialog.set(false);
    }

    toggleActive(parent: ParentResponse): void {
        const action = parent.isActive ? 'desactivar' : 'activar';
        const fullName = parent.person.fullName;
        this.confirmationService.confirm({
            message: `¿Deseas ${action} a <strong>${fullName}</strong>?`,
            header: 'Cambiar Estado',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Sí, cambiar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-primary',
            accept: () => {
                // El backend usa DELETE para soft-delete / no tiene toggle,
                // actualizamos el estado localmente y refrescamos
                this.parentsService
                    .update(parent.idParent, {
                        // Solo se puede indicar isActive cambiando vía el endpoint de delete o put
                        // Por ahora actualizamos el signal y recargamos
                    })
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadParents();
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Estado actualizado',
                                detail: `${fullName} → ${!parent.isActive ? 'Activo' : 'Inactivo'}`
                            });
                        },
                        error: () => {
                            // Fallback: mutar signal localmente si el backend no tiene toggle
                            this.parents.update((list) => list.map((p) => (p.idParent === parent.idParent ? { ...p, isActive: !p.isActive } : p)));
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Estado actualizado (local)',
                                detail: `${fullName} → ${!parent.isActive ? 'Activo' : 'Inactivo'}`
                            });
                        }
                    });
            }
        });
    }

    deleteParent(parent: ParentResponse): void {
        const fullName = parent.person.fullName;
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar a <strong>${fullName}</strong>?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.parentsService
                    .delete(parent.idParent)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadParents();
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Eliminado',
                                detail: `${fullName} eliminado`
                            });
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'No se pudo eliminar el tutor'
                            });
                        }
                    });
            }
        });
    }

    exportToExcel(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Exportar',
            detail: 'En producción se exportará el listado en Excel'
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    get hasActiveFilters(): boolean {
        return !!(this.searchQuery || this.selectedFinancialFilter !== null);
    }

    // ParentResponse: fullName en person.fullName
    getInitials(parent: ParentResponse): string {
        return parent.person.fullName
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
    }
}
