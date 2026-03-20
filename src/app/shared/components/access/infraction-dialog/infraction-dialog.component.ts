// src/app/shared/components/access/infraction-dialog/infraction-dialog.component.ts

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';

import { AccessControlService, InfractionRequest } from '../../../../core/services/api/access-control.service';
import { AuthService } from '../../../../core/services/api/auth.service';
import { InfractionTypeResponse } from '../../../../core/models/operations.models';
import { StudentResponse } from '../../../../core/models/student.dto';

@Component({
    selector: 'app-infraction-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, TextareaModule, ToggleSwitchModule, TagModule],
    templateUrl: './infraction-dialog.component.html',
    styleUrl: './infraction-dialog.component.scss'
})
export class InfractionDialogComponent implements OnChanges, OnInit {
    @Input() students: StudentResponse[] = [];
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    loading = signal(false);
    infractionTypes = signal<InfractionTypeResponse[]>([]);
    selectedSeverity = signal<string>('');

    constructor(
        private fb: FormBuilder,
        private accessService: AccessControlService,
        private authService: AuthService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        this.accessService.getInfractionTypes(idCompany).subscribe({
            next: (res) => {
                if (res.success) this.infractionTypes.set(res.data ?? []);
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true) {
            this.form.reset();
            this.form.patchValue({ incidentDate: new Date(), parentNotified: false });
            this.selectedSeverity.set('');
        }
    }

    private buildForm(): void {
        this.form = this.fb.group({
            idStudent: [null, Validators.required],
            idInfractionType: [null, Validators.required],
            incidentDate: [new Date(), Validators.required],
            description: ['', Validators.required],
            sanctionApplied: [''],
            parentNotified: [false]
        });

        // Mostrar severidad al cambiar el tipo
        this.form.get('idInfractionType')?.valueChanges.subscribe((id) => {
            const found = this.infractionTypes().find((t) => t.idInfractionType === id);
            this.selectedSeverity.set(found?.severity ?? '');
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.loading.set(true);

        const v = this.form.value;
        const dt: Date = v.incidentDate instanceof Date ? v.incidentDate : new Date(v.incidentDate);

        const req: InfractionRequest = {
            idStudent: v.idStudent,
            idInfractionType: v.idInfractionType,
            incidentDate: dt.toISOString().split('T')[0],
            description: v.description,
            sanctionApplied: v.sanctionApplied || undefined,
            parentNotified: v.parentNotified
        };

        this.accessService.registerInfraction(req).subscribe({
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

    getSeverityTag(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            LOW: 'info',
            MEDIUM: 'warn',
            HIGH: 'danger',
            CRITICAL: 'contrast'
        };
        return map[s] ?? 'secondary';
    }

    getSeverityLabel(s: string): string {
        const map: Record<string, string> = {
            LOW: 'Leve',
            MEDIUM: 'Moderada',
            HIGH: 'Grave',
            CRITICAL: 'Crítica'
        };
        return map[s] ?? s;
    }

    // StudentResponse: fullName en person.fullName, gradeName/sectionName directos
    get studentOptions(): { label: string; value: number }[] {
        return this.students.map((s) => ({
            label: `${s.person.fullName} — ${s.gradeName ?? ''} ${s.sectionName ?? ''}`.trimEnd(),
            value: s.idStudent
        }));
    }

    get typeOptions(): { label: string; value: number }[] {
        return this.infractionTypes().map((t) => ({
            label: t.name,
            value: t.idInfractionType
        }));
    }
}
