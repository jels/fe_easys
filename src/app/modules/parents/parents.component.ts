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

import { ParentMock } from '../../shared/data/people.mock';
import { ParentsService, ParentFilter } from '../../core/services/conf/parents.service';
import { ParentFormDialogComponent } from '../../shared/components/parent/parent-form-dialog/parent-form-dialog.component';
import { ParentDetailDialogComponent } from '../../shared/components/parent/parent-detail-dialog/parent-detail-dialog.component';

@Component({
    selector: 'app-parents',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ToastModule, ConfirmDialogModule, TagModule, SelectModule, TableModule, SkeletonModule, ButtonModule, TooltipModule, ParentFormDialogComponent, ParentDetailDialogComponent],
    templateUrl: './parents.component.html',
    styleUrl: './parents.component.scss',
    providers: [ConfirmationService, MessageService]
})
export class ParentsComponent implements OnInit, OnDestroy {
    parents = signal<ParentMock[]>([]);
    loading = signal(false);
    totalRecords = signal(0);

    // Paginación
    page = 1;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];

    // Filtros
    searchQuery = '';
    selectedFinancialFilter: boolean | null = null;

    financialOptions = [
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

    // ── Data ─────────────────────────────────────────────────────────────────

    loadParents(): void {
        this.loading.set(true);

        const filters: ParentFilter = {};
        if (this.searchQuery) filters.search = this.searchQuery;
        if (this.selectedFinancialFilter !== null) filters.isFinancialResponsible = this.selectedFinancialFilter;

        this.parentsService
            .getAll(filters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.totalRecords.set(data.length);
                    const start = (this.page - 1) * this.pageSize;
                    this.parents.set(data.slice(start, start + this.pageSize));
                    this.loading.set(false);
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los padres/tutores' });
                    this.loading.set(false);
                }
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

    onSearch(): void {
        this.page = 1;
        this.loadParents();
    }
    onFilterChange(): void {
        this.page = 1;
        this.loadParents();
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedFinancialFilter = null;
        this.page = 1;
        this.loadParents();
    }

    onPageChange(event: TableLazyLoadEvent): void {
        this.page = (event.first ?? 0) / (event.rows ?? 10) + 1;
        this.pageSize = event.rows ?? 10;
        this.loadParents();
    }

    // ── Acciones ─────────────────────────────────────────────────────────────

    openCreate(): void {
        this.selectedParentId.set(null);
        this.showFormDialog.set(true);
    }

    openEdit(parent: ParentMock): void {
        this.selectedParentId.set(parent.idParent);
        this.showFormDialog.set(true);
    }

    openDetail(parent: ParentMock): void {
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

    toggleActive(parent: ParentMock): void {
        const action = parent.isActive ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
            message: `¿Deseas ${action} a <strong>${parent.fullName}</strong>?`,
            header: 'Cambiar Estado',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Sí, cambiar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-primary',
            accept: () => {
                const updated = this.parents().map((p) => (p.idParent === parent.idParent ? { ...p, isActive: !p.isActive } : p));
                this.parents.set(updated);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: `${parent.fullName} → ${!parent.isActive ? 'Activo' : 'Inactivo'}`
                });
            }
        });
    }

    deleteParent(parent: ParentMock): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar a <strong>${parent.fullName}</strong>?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.parents.set(this.parents().filter((p) => p.idParent !== parent.idParent));
                this.totalRecords.update((v) => v - 1);
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: `${parent.fullName} eliminado` });
            }
        });
    }

    exportToExcel(): void {
        this.messageService.add({ severity: 'info', summary: 'Exportar', detail: 'En producción se exportará el listado en Excel' });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    get hasActiveFilters(): boolean {
        return !!(this.searchQuery || this.selectedFinancialFilter !== null);
    }

    getInitials(fullName: string): string {
        return fullName
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
    }
}
