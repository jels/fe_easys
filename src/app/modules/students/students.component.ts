// src/app/modules/students/students.component.ts

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

import { StudentsService } from '../../core/services/api/students.service';
import { AuthService } from '../../core/services/api/auth.service';
import { StudentFormDialogComponent } from '../../shared/components/student/student-form-dialog/student-form-dialog.component';
import { StudentDetailDialogComponent } from '../../shared/components/student/student-detail-dialog/student-detail-dialog.component';
import { StudentFilter, StudentResponse } from '../../core/models/student.dto';
import { AcademicsService } from '../../core/services/api/academics.service';

@Component({
    selector: 'app-students',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ToastModule, ConfirmDialogModule, TagModule, SelectModule, TableModule, SkeletonModule, ButtonModule, TooltipModule, StudentFormDialogComponent, StudentDetailDialogComponent],
    templateUrl: './students.component.html',
    styleUrl: './students.component.scss',
    providers: [ConfirmationService, MessageService]
})
export class StudentsComponent implements OnInit, OnDestroy {
    students = signal<StudentResponse[]>([]);
    loading = signal(false);
    grades = signal<{ idGrade: number; name: string }[]>([]);

    // Paginación server-side
    totalRecords = signal(0);
    page = 0; // backend usa 0-based
    pageSize = 10;
    pageSizeOptions = [5, 10, 25, 50];

    // Filtros
    searchQuery = '';
    selectedGrade: number | null = null;
    selectedStatus: string | null = null;

    statusOptions = [
        { label: 'Todos', value: null },
        { label: 'Activo', value: 'ACTIVE' },
        { label: 'Inactivo', value: 'INACTIVE' },
        { label: 'Egresado', value: 'GRADUATED' },
        { label: 'Transferido', value: 'TRANSFERRED' },
        { label: 'Retirado', value: 'WITHDRAWN' }
    ];

    // Modales
    showFormDialog = signal(false);
    showDetailDialog = signal(false);
    selectedStudentId = signal<number | null>(null);

    private destroy$ = new Subject<void>();

    constructor(
        private studentsService: StudentsService,
        private academicsService: AcademicsService,
        private authService: AuthService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadGrades();
        this.loadStudents();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Data Loading ──────────────────────────────────────────────────────────

    loadGrades(): void {
        const idCompany = this.authService.idCompany || 1;
        console.log('LLega aqui');

        if (!idCompany) return;

        this.academicsService
            .getGrades(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.grades.set(
                            res.data.map((g: any) => ({
                                idGrade: g.idGrade,
                                name: g.name
                            }))
                        );
                    }
                }
                // error: () => {} // sin grados no bloquea la pantalla
            });
    }

    loadStudents(): void {
        const idCompany = this.authService.idCompany || 1;
        if (!idCompany) return;

        this.loading.set(true);

        const filters: StudentFilter = {
            page: this.page,
            size: this.pageSize,
            search: this.searchQuery || undefined,
            status: this.selectedStatus || undefined,
            idGrade: this.selectedGrade || undefined
        };

        this.studentsService
            .getAll(idCompany, filters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.students.set(res.data.content);
                        this.totalRecords.set(res.data.totalElements);
                    }
                    this.loading.set(false);
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los estudiantes'
                    });
                    this.loading.set(false);
                }
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

    onSearch(): void {
        this.page = 0;
        this.loadStudents();
    }

    onFilterChange(): void {
        this.page = 0;
        this.loadStudents();
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedGrade = null;
        this.selectedStatus = null;
        this.page = 0;
        this.loadStudents();
    }

    onPageChange(event: TableLazyLoadEvent): void {
        this.page = Math.floor((event.first ?? 0) / (event.rows ?? 10));
        this.pageSize = event.rows ?? 10;
        this.loadStudents();
    }

    // ── Acciones ──────────────────────────────────────────────────────────────

    openCreate(): void {
        this.selectedStudentId.set(null);
        this.showFormDialog.set(true);
    }

    openEdit(student: StudentResponse): void {
        this.selectedStudentId.set(student.idStudent);
        this.showFormDialog.set(true);
    }

    openDetail(student: StudentResponse): void {
        this.selectedStudentId.set(student.idStudent);
        this.showDetailDialog.set(true);
    }

    onFormSaved(): void {
        this.showFormDialog.set(false);
        this.loadStudents();
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: this.selectedStudentId() ? 'Estudiante actualizado correctamente' : 'Estudiante registrado correctamente'
        });
    }

    onFormClosed(): void {
        this.showFormDialog.set(false);
    }
    onDetailClosed(): void {
        this.showDetailDialog.set(false);
    }

    toggleStatus(student: StudentResponse): void {
        const newStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const actionLabel = newStatus === 'ACTIVE' ? 'activar' : 'desactivar';

        this.confirmationService.confirm({
            message: `¿Deseas ${actionLabel} a <strong>${student.person.fullName}</strong>?`,
            header: 'Cambiar Estado',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Sí, cambiar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-primary',
            accept: () => {
                this.studentsService
                    .update(student.idStudent, { status: newStatus })
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadStudents();
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Estado actualizado',
                                detail: `${student.person.fullName} → ${newStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}`
                            });
                        },
                        error: () =>
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'No se pudo actualizar el estado'
                            })
                    });
            }
        });
    }

    deleteStudent(student: StudentResponse): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar a <strong>${student.person.fullName}</strong>? Esta acción no se puede deshacer.`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.studentsService
                    .delete(student.idStudent)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadStudents();
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Eliminado',
                                detail: `${student.person.fullName} eliminado correctamente`
                            });
                        },
                        error: () =>
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'No se pudo eliminar el estudiante'
                            })
                    });
            }
        });
    }

    exportToExcel(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Exportar',
            detail: 'Función de exportación disponible próximamente'
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = {
            ACTIVE: 'success',
            INACTIVE: 'danger',
            GRADUATED: 'info',
            TRANSFERRED: 'warn',
            WITHDRAWN: 'secondary'
        };
        return map[status] ?? 'secondary';
    }

    getStatusLabel(status: string): string {
        const map: Record<string, string> = {
            ACTIVE: 'Activo',
            INACTIVE: 'Inactivo',
            GRADUATED: 'Egresado',
            TRANSFERRED: 'Transferido',
            WITHDRAWN: 'Retirado'
        };
        return map[status] ?? status;
    }

    get hasActiveFilters(): boolean {
        return !!(this.searchQuery || this.selectedGrade || this.selectedStatus);
    }
}
