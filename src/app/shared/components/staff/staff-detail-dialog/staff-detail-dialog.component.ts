// src/app/shared/components/staff/staff-detail-dialog/staff-detail-dialog.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

import { StaffService } from '../../../../core/services/conf/staff.service';
import { StaffMock } from '../../../../shared/data/staff.mock';
import { StaffAccessLogMock } from '../../../../shared/data/operations.mock';
import { SectionMock, SubjectMock } from '../../../../shared/data/academic.mock';

@Component({
    selector: 'app-staff-detail-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule, TagModule, TabsModule, SkeletonModule, TableModule, TooltipModule, DividerModule],
    templateUrl: './staff-detail-dialog.component.html',
    styleUrl: './staff-detail-dialog.component.scss'
})
export class StaffDetailDialogComponent implements OnChanges {
    @Input() staffId: number | null = null;
    @Input() visible = false;

    @Output() onEdit = new EventEmitter<StaffMock>();
    @Output() onClose = new EventEmitter<void>();

    member = signal<StaffMock | null>(null);
    accessLogs = signal<StaffAccessLogMock[]>([]);
    sections = signal<SectionMock[]>([]);
    subjects = signal<SubjectMock[]>([]);
    loading = signal(false);

    constructor(private staffService: StaffService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true && this.staffId) {
            this.loadAll(this.staffId);
        }
        if (changes['visible']?.currentValue === false) {
            this.clearData();
        }
    }

    private loadAll(id: number): void {
        this.loading.set(true);

        this.staffService.getById(id).subscribe((m) => {
            this.member.set(m ?? null);
            this.loading.set(false);

            // Si es docente, cargar secciones y materias
            if (m?.staffType === 'TEACHER') {
                this.staffService.getAssignedSections(id).subscribe((s) => this.sections.set(s));
                this.staffService.getAssignedSubjects(id).subscribe((s) => this.subjects.set(s));
            }
        });

        this.staffService.getAccessLogs(id).subscribe((logs) => this.accessLogs.set(logs));
    }

    private clearData(): void {
        this.member.set(null);
        this.accessLogs.set([]);
        this.sections.set([]);
        this.subjects.set([]);
    }

    editMember(): void {
        if (this.member()) this.onEdit.emit(this.member()!);
    }

    close(): void {
        this.onClose.emit();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    get fullName(): string {
        const m = this.member();
        return m ? `${m.person.firstName} ${m.person.lastName}` : '';
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
    }

    getTypeLabel(type: string): string {
        const map: Record<string, string> = { TEACHER: 'Docente', ADMINISTRATIVE: 'Administrativo', DIRECTOR: 'Director', SUPPORT: 'Soporte' };
        return map[type] ?? type;
    }

    getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            TEACHER: 'info',
            ADMINISTRATIVE: 'success',
            DIRECTOR: 'contrast',
            SUPPORT: 'secondary'
        };
        return map[type] ?? 'secondary';
    }

    getStatusLabel(status: string): string {
        const map: Record<string, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo', ON_LEAVE: 'De licencia' };
        return map[status] ?? status;
    }

    getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = {
            ACTIVE: 'success',
            INACTIVE: 'danger',
            ON_LEAVE: 'warn'
        };
        return map[status] ?? 'secondary';
    }

    getContractLabel(type: string): string {
        const map: Record<string, string> = { FULL_TIME: 'Tiempo completo', PART_TIME: 'Medio tiempo', HOURLY: 'Por hora', CONTRACTOR: 'Contratado' };
        return map[type] ?? type;
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(amount);
    }

    formatDatetime(dt: string): string {
        return new Date(dt).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    get totalLogs(): number {
        return this.accessLogs().length;
    }
    get lateLogs(): number {
        return this.accessLogs().filter((l) => l.isLate).length;
    }
    //get absentLogs(): number {
    //    return this.accessLogs().filter((l) => l.isAbsent).length;
    //}
    get isTeacher(): boolean {
        return this.member()?.staffType === 'TEACHER';
    }
}
