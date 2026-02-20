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

import { AccessControlService, InfractionRequest } from '../../../../core/services/conf/access-control.service';
import { StudentMock } from '../../../../shared/data/people.mock';
import { InfractionTypeMock } from '../../../../shared/data/operations.mock';

@Component({
    selector: 'app-infraction-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, TextareaModule, ToggleSwitchModule, TagModule],
    templateUrl: './infraction-dialog.component.html',
    styleUrl: './infraction-dialog.component.scss'
})
export class InfractionDialogComponent implements OnChanges, OnInit {
    @Input() students: StudentMock[] = [];
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    loading = signal(false);
    infractionTypes = signal<InfractionTypeMock[]>([]);
    selectedSeverity = signal<string>('');

    constructor(
        private fb: FormBuilder,
        private accessService: AccessControlService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        this.accessService.getInfractionTypes().subscribe((types) => this.infractionTypes.set(types));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true) {
            this.form.reset();
            this.form.patchValue({
                incidentDate: new Date(),
                parentNotified: false
            });
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

        // Cuando cambia el tipo, mostrar la severidad
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
        const map: Record<string, string> = { LOW: 'Leve', MEDIUM: 'Moderada', HIGH: 'Grave', CRITICAL: 'Crítica' };
        return map[s] ?? s;
    }

    get studentOptions(): { label: string; value: number }[] {
        return this.students.map((s) => ({ label: `${s.fullName} — ${s.gradeName} ${s.sectionName}`, value: s.idStudent }));
    }

    get typeOptions(): { label: string; value: number }[] {
        return this.infractionTypes().map((t) => ({ label: t.name, value: t.idInfractionType }));
    }
}
