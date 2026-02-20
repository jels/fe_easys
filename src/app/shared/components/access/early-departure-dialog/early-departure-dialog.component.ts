// src/app/shared/components/access/early-departure-dialog/early-departure-dialog.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';

import { AccessControlService, EarlyDepartureRequest } from '../../../../core/services/conf/access-control.service';
import { StudentMock } from '../../../../shared/data/people.mock';
import { StaffMock } from '../../../data/staff.mock';

@Component({
    selector: 'app-early-departure-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, TextareaModule],
    templateUrl: './early-departure-dialog.component.html',
    styleUrl: './early-departure-dialog.component.scss'
})
export class EarlyDepartureDialogComponent implements OnChanges {
    @Input() students: StudentMock[] = [];
    @Input() staff: StaffMock[] = [];
    @Input() defaultDate = '';
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    loading = signal(false);

    relationshipOptions = [
        { label: 'Padre', value: 'FATHER' },
        { label: 'Madre', value: 'MOTHER' },
        { label: 'Tutor Legal', value: 'LEGAL_GUARDIAN' },
        { label: 'Abuelo/a', value: 'GRANDPARENT' },
        { label: 'Tío/a', value: 'UNCLE_AUNT' },
        { label: 'Hermano/a', value: 'SIBLING' },
        { label: 'Otro', value: 'OTHER' }
    ];

    constructor(
        private fb: FormBuilder,
        private accessService: AccessControlService
    ) {
        this.buildForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true) {
            this.form.reset();
            this.form.patchValue({ departureTime: new Date() });
        }
    }

    private buildForm(): void {
        this.form = this.fb.group({
            idStudent: [null, Validators.required],
            departureTime: [new Date(), Validators.required],
            pickedUpByName: ['', Validators.required],
            pickedUpByRelationship: [null, Validators.required],
            authorizedByStaffId: [null],
            reason: ['']
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.loading.set(true);

        const v = this.form.value;
        const dt: Date = v.departureTime instanceof Date ? v.departureTime : new Date(v.departureTime);

        const req: EarlyDepartureRequest = {
            idStudent: v.idStudent,
            departureDatetime: dt.toISOString(),
            pickedUpByName: v.pickedUpByName,
            pickedUpByRelationship: v.pickedUpByRelationship,
            reason: v.reason || undefined,
            authorizedByStaffId: v.authorizedByStaffId || undefined
        };

        this.accessService.registerEarlyDeparture(req).subscribe({
            next: () => {
                this.loading.set(false);
                this.onSave.emit();
            },
            error: () => this.loading.set(false)
        });
    }

    close(): void {
        this.form.reset();
        this.onClose.emit();
    }

    isFieldInvalid(path: string): boolean {
        const c = this.form.get(path);
        return !!(c?.invalid && c?.touched);
    }

    get studentOptions(): { label: string; value: number }[] {
        return this.students.map((s) => ({ label: `${s.fullName} — ${s.gradeName} ${s.sectionName}`, value: s.idStudent }));
    }

    get staffOptions(): { label: string; value: number }[] {
        return this.staff.map((s) => ({ label: `${s.fullName} (${s.position ?? s.staffType})`, value: s.idStaff }));
    }
}
