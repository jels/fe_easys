// src/app/shared/components/access/access-log-dialog/access-log-dialog.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';

import { AccessControlService, AccessLogRequest } from '../../../../core/services/conf/access-control.service';
import { StudentMock } from '../../../data/people.mock';
import { StaffMock } from '../../../data/staff.mock';

@Component({
    selector: 'app-access-log-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, ToggleSwitchModule, TextareaModule, DividerModule],
    templateUrl: './access-log-dialog.component.html',
    styleUrl: './access-log-dialog.component.scss'
})
export class AccessLogDialogComponent implements OnChanges {
    @Input() type: 'STUDENT' | 'STAFF' = 'STUDENT';
    @Input() students: StudentMock[] = [];
    @Input() staff: StaffMock[] = [];
    @Input() defaultDate = '';
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    loading = signal(false);

    constructor(
        private fb: FormBuilder,
        private accessService: AccessControlService
    ) {
        this.buildForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true) {
            this.form.reset();
            this.form.patchValue({
                isAbsent: false,
                absenceJustified: false,
                accessDate: this.defaultDate || new Date().toISOString().split('T')[0]
            });
        }
    }

    private buildForm(): void {
        this.form = this.fb.group({
            subjectId: [null, Validators.required],
            accessDate: [new Date().toISOString().split('T')[0], Validators.required],
            entryTime: [null],
            exitTime: [null],
            isAbsent: [false],
            absenceJustified: [false],
            observations: ['']
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.loading.set(true);

        const v = this.form.value;
        const req: AccessLogRequest = {
            accessDate: v.accessDate,
            entryTime: v.entryTime ? `${v.accessDate}T${this.toTimeStr(v.entryTime)}` : undefined,
            exitTime: v.exitTime ? `${v.accessDate}T${this.toTimeStr(v.exitTime)}` : undefined,
            isAbsent: v.isAbsent,
            absenceJustified: v.absenceJustified,
            observations: v.observations || undefined
        };

        if (this.type === 'STUDENT') {
            req.idStudent = v.subjectId;
            this.accessService.registerStudentAccess(req).subscribe({
                next: () => {
                    this.loading.set(false);
                    this.onSave.emit();
                },
                error: () => this.loading.set(false)
            });
        } else {
            req.idStaff = v.subjectId;
            this.accessService.registerStaffAccess(req).subscribe({
                next: () => {
                    this.loading.set(false);
                    this.onSave.emit();
                },
                error: () => this.loading.set(false)
            });
        }
    }

    close(): void {
        this.form.reset();
        this.onClose.emit();
    }

    isFieldInvalid(path: string): boolean {
        const c = this.form.get(path);
        return !!(c?.invalid && c?.touched);
    }

    private toTimeStr(date: Date | string): string {
        if (typeof date === 'string') return date;
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}:00`;
    }

    get isStudentMode(): boolean {
        return this.type === 'STUDENT';
    }

    get subjectOptions(): { label: string; value: number }[] {
        if (this.isStudentMode) {
            return this.students.map((s) => ({ label: `${s.fullName} (${s.enrollmentNumber})`, value: s.idStudent }));
        }
        return this.staff.map((s) => ({ label: `${s.fullName} (${s.employeeNumber})`, value: s.idStaff }));
    }

    get dialogTitle(): string {
        return this.isStudentMode ? 'Registrar Acceso - Alumno' : 'Registrar Acceso - Personal';
    }

    get isAbsent(): boolean {
        return !!this.form.get('isAbsent')?.value;
    }
}
