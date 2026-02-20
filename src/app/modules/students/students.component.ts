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

import { StudentMock } from '../../shared/data/people.mock';
import { StudentsService, StudentFilter } from '../../core/services/conf/students.service';
import { AcademicsService } from '../../core/services/conf/academics.service';
import { GradeMock } from '../../shared/data/academic.mock';
import { StudentFormDialogComponent } from '../../shared/components/student/student-form-dialog/student-form-dialog.component';
import { StudentDetailDialogComponent } from '../../shared/components/student/student-detail-dialog/student-detail-dialog.component';

// Componentes modales (shared)

@Component({
    selector: 'app-students',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        ToastModule,
        ConfirmDialogModule,
        TagModule,
        SelectModule,
        TableModule,
        SkeletonModule,
        ButtonModule,
        TooltipModule,
        // Dialogs
        StudentFormDialogComponent,
        StudentDetailDialogComponent
    ],
    templateUrl: './students.component.html',
    styleUrl: './students.component.scss',
    providers: [ConfirmationService, MessageService]
})
export class StudentsComponent implements OnInit, OnDestroy {
    students = signal<StudentMock[]>([]);
    loading = signal(false);
    grades = signal<GradeMock[]>([]);

    // Paginación
    totalRecords = signal(0);
    page = 1;
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

    // Control de modales
    showFormDialog = signal(false);
    showDetailDialog = signal(false);
    selectedStudentId = signal<number | null>(null);

    private destroy$ = new Subject<void>();

    constructor(
        private studentsService: StudentsService,
        private academicsService: AcademicsService,
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
        this.academicsService
            .getGrades()
            .pipe(takeUntil(this.destroy$))
            .subscribe((grades) => {
                this.grades.set(grades);
            });
    }

    loadStudents(): void {
        this.loading.set(true);

        const filters: StudentFilter = {};
        if (this.searchQuery) filters.search = this.searchQuery;
        if (this.selectedGrade) filters.idGrade = this.selectedGrade;
        if (this.selectedStatus) filters.status = this.selectedStatus;

        this.studentsService
            .getAll(filters)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    // Paginación local
                    this.totalRecords.set(data.length);
                    const start = (this.page - 1) * this.pageSize;
                    this.students.set(data.slice(start, start + this.pageSize));
                    this.loading.set(false);
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estudiantes' });
                    this.loading.set(false);
                }
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

    onSearch(): void {
        this.page = 1;
        this.loadStudents();
    }

    onFilterChange(): void {
        this.page = 1;
        this.loadStudents();
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedGrade = null;
        this.selectedStatus = null;
        this.page = 1;
        this.loadStudents();
    }

    onPageChange(event: TableLazyLoadEvent): void {
        this.page = (event.first ?? 0) / (event.rows ?? 10) + 1;
        this.pageSize = event.rows ?? 10;
        this.loadStudents();
    }

    // ── Acciones de tabla ─────────────────────────────────────────────────────

    openCreate(): void {
        this.selectedStudentId.set(null);
        this.showFormDialog.set(true);
    }

    openEdit(student: StudentMock): void {
        this.selectedStudentId.set(student.idStudent);
        this.showFormDialog.set(true);
    }

    openDetail(student: StudentMock): void {
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

    toggleStatus(student: StudentMock): void {
        const newStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const actionLabel = newStatus === 'ACTIVE' ? 'activar' : 'desactivar';

        this.confirmationService.confirm({
            message: `¿Deseas ${actionLabel} a <strong>${student.fullName}</strong>?`,
            header: 'Cambiar Estado',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Sí, cambiar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-primary',
            accept: () => {
                // Actualización local (DEMO)
                const updated = this.students().map((s) => (s.idStudent === student.idStudent ? { ...s, status: newStatus } : s));
                this.students.set(updated);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: `${student.fullName} → ${newStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}`
                });
            }
        });
    }

    deleteStudent(student: StudentMock): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar a <strong>${student.fullName}</strong>? Esta acción no se puede deshacer.`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                // Eliminación local (DEMO)
                this.students.set(this.students().filter((s) => s.idStudent !== student.idStudent));
                this.totalRecords.update((v) => v - 1);
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: `${student.fullName} eliminado correctamente` });
            }
        });
    }

    exportToExcel(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Exportar',
            detail: 'En producción se exportará el listado de estudiantes en Excel'
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
