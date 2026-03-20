// src/app/modules/staff/staff.component.ts

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
import { StaffService, StaffFilter } from '../../core/services/api/staff.service';
import { AuthService } from '../../core/services/api/auth.service';

// Models
import { StaffResponse } from '../../core/models/staff.models';

// Dialogs
import { StaffFormDialogComponent } from '../../shared/components/staff/staff-form-dialog/staff-form-dialog.component';
import { StaffDetailDialogComponent } from '../../shared/components/staff/staff-detail-dialog/staff-detail-dialog.component';

@Component({
    selector: 'app-staff',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ToastModule, ConfirmDialogModule, TagModule, SelectModule, TableModule, SkeletonModule, ButtonModule, TooltipModule, StaffFormDialogComponent, StaffDetailDialogComponent],
    templateUrl: './staff.component.html',
    styleUrl: './staff.component.scss',
    providers: [ConfirmationService, MessageService]
})
export class StaffComponent implements OnInit, OnDestroy {
    staffList = signal<StaffResponse[]>([]);
    loading = signal(false);
    totalRecords = signal(0);

    // Paginación server-side (0-based para Spring Data)
    page = 0;
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];

    // Filtros
    searchQuery = '';
    selectedType: string | null = null;
    selectedStatus: string | null = null;

    readonly typeOptions = [
        { label: 'Todos los tipos', value: null },
        { label: 'Docente', value: 'TEACHER' },
        { label: 'Administrativo', value: 'ADMINISTRATIVE' },
        { label: 'Director', value: 'DIRECTOR' },
        { label: 'Soporte', value: 'SUPPORT' }
    ];

    readonly statusOptions = [
        { label: 'Todos los estados', value: null },
        { label: 'Activo', value: 'ACTIVE' },
        { label: 'Inactivo', value: 'INACTIVE' },
        { label: 'De licencia', value: 'ON_LEAVE' }
    ];

    // Modales
    showFormDialog = signal(false);
    showDetailDialog = signal(false);
    selectedStaffId = signal<number | null>(null);

    private destroy$ = new Subject<void>();

    constructor(
        private staffService: StaffService,
        private authService: AuthService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadStaff();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Data ──────────────────────────────────────────────────────────────────

    loadStaff(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loading.set(true);

        const filters: StaffFilter = {
            page: this.page,
            size: this.pageSize
        };
        if (this.searchQuery) filters.search = this.searchQuery;
        if (this.selectedType) filters.staffType = this.selectedType;
        if (this.selectedStatus) filters.status = this.selectedStatus;

        this.staffService
            .getAll(idCompany, filters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.staffList.set(res.data.content);
                        this.totalRecords.set(res.data.totalElements);
                    }
                    this.loading.set(false);
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo cargar el personal'
                    });
                    this.loading.set(false);
                }
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

    onSearch(): void {
        this.page = 0;
        this.loadStaff();
    }
    onFilterChange(): void {
        this.page = 0;
        this.loadStaff();
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedType = null;
        this.selectedStatus = null;
        this.page = 0;
        this.loadStaff();
    }

    onPageChange(event: TableLazyLoadEvent): void {
        this.page = Math.floor((event.first ?? 0) / (event.rows ?? 10));
        this.pageSize = event.rows ?? 10;
        this.loadStaff();
    }

    // ── Acciones ──────────────────────────────────────────────────────────────

    openCreate(): void {
        this.selectedStaffId.set(null);
        this.showFormDialog.set(true);
    }

    openEdit(member: StaffResponse): void {
        this.selectedStaffId.set(member.idStaff);
        this.showFormDialog.set(true);
    }

    openDetail(member: StaffResponse): void {
        this.selectedStaffId.set(member.idStaff);
        this.showDetailDialog.set(true);
    }

    onFormSaved(): void {
        this.showFormDialog.set(false);
        this.loadStaff();
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: this.selectedStaffId() ? 'Empleado actualizado correctamente' : 'Empleado registrado correctamente'
        });
    }

    onFormClosed(): void {
        this.showFormDialog.set(false);
    }
    onDetailClosed(): void {
        this.showDetailDialog.set(false);
    }

    toggleStatus(member: StaffResponse): void {
        const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const actionLabel = newStatus === 'ACTIVE' ? 'activar' : 'desactivar';
        const fullName = member.person.fullName;

        this.confirmationService.confirm({
            message: `¿Deseas ${actionLabel} a <strong>${fullName}</strong>?`,
            header: 'Cambiar Estado',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Sí, cambiar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-primary',
            accept: () => {
                this.staffService
                    .update(member.idStaff, { status: newStatus })
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadStaff();
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Estado actualizado',
                                detail: `${fullName} → ${newStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}`
                            });
                        },
                        error: () => {
                            // Fallback local si el backend no tiene endpoint de toggle
                            this.staffList.update((list) => list.map((s) => (s.idStaff === member.idStaff ? { ...s, status: newStatus } : s)));
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Estado actualizado (local)',
                                detail: `${fullName} → ${newStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}`
                            });
                        }
                    });
            }
        });
    }

    deleteStaff(member: StaffResponse): void {
        const fullName = member.person.fullName;
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar a <strong>${fullName}</strong>?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.staffService
                    .delete(member.idStaff)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadStaff();
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
                                detail: 'No se pudo eliminar al empleado'
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
            detail: 'En producción se exportará el listado del personal en Excel'
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    get hasActiveFilters(): boolean {
        return !!(this.searchQuery || this.selectedType || this.selectedStatus);
    }

    getTypeLabel(type: string): string {
        return (
            (
                {
                    TEACHER: 'Docente',
                    ADMINISTRATIVE: 'Administrativo',
                    DIRECTOR: 'Director',
                    SUPPORT: 'Soporte'
                } as Record<string, string>
            )[type] ?? type
        );
    }

    getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        return (
            (
                {
                    TEACHER: 'info',
                    ADMINISTRATIVE: 'success',
                    DIRECTOR: 'contrast',
                    SUPPORT: 'secondary'
                } as Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'>
            )[type] ?? 'secondary'
        );
    }

    getStatusLabel(status: string): string {
        return ({ ACTIVE: 'Activo', INACTIVE: 'Inactivo', ON_LEAVE: 'De licencia' } as Record<string, string>)[status] ?? status;
    }

    getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        return (
            (
                {
                    ACTIVE: 'success',
                    INACTIVE: 'danger',
                    ON_LEAVE: 'warn'
                } as Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'>
            )[status] ?? 'secondary'
        );
    }

    // StaffResponse: fullName en person.fullName
    getInitials(member: StaffResponse): string {
        return member.person.fullName
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
    }
}
