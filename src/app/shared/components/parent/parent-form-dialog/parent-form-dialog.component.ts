// src/app/shared/components/parent/parent-form-dialog/parent-form-dialog.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

import { ParentsService } from '../../../../core/services/conf/parents.service';
import { DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS } from '../../../../core/models/enums/person.enum';

@Component({
    selector: 'app-parent-form-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, ToggleSwitchModule, SkeletonModule, DividerModule],
    templateUrl: './parent-form-dialog.component.html',
    styleUrl: './parent-form-dialog.component.scss'
})
export class ParentFormDialogComponent implements OnChanges {
    @Input() parentId: number | null = null;
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    isEditMode = signal(false);
    loading = signal(false);
    loadingData = signal(false);

    documentTypeOptions = DOCUMENT_TYPE_OPTIONS;
    genderOptions = GENDER_OPTIONS;

    constructor(
        private fb: FormBuilder,
        private parentsService: ParentsService
    ) {
        this.buildForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true) {
            this.onDialogOpen();
        }
    }

    private onDialogOpen(): void {
        if (this.parentId) {
            this.isEditMode.set(true);
            this.loadParent(this.parentId);
        } else {
            this.isEditMode.set(false);
            this.form.reset();
            this.form.patchValue({ person: { documentType: 'CI' }, isFinancialResponsible: false });
            this.loadingData.set(false);
        }
    }

    private buildForm(): void {
        this.form = this.fb.group({
            person: this.fb.group({
                firstName: ['', [Validators.required, Validators.minLength(2)]],
                lastName: ['', [Validators.required, Validators.minLength(2)]],
                documentType: ['CI', Validators.required],
                documentNumber: ['', Validators.required],
                birthDate: [null],
                gender: [null],
                mobilePhone: [''],
                phone: [''],
                email: ['', Validators.email],
                city: [''],
                address: ['']
            }),
            occupation: [''],
            workplace: [''],
            workPhone: [''],
            isFinancialResponsible: [false]
        });
    }

    private loadParent(id: number): void {
        this.loadingData.set(true);
        this.parentsService.getById(id).subscribe({
            next: (parent) => {
                if (parent) {
                    this.form.patchValue({
                        occupation: parent.occupation,
                        workplace: parent.workplace,
                        workPhone: parent.workPhone,
                        isFinancialResponsible: parent.isFinancialResponsible,
                        person: {
                            firstName: parent.person.firstName,
                            lastName: parent.person.lastName,
                            documentType: parent.person.documentType,
                            documentNumber: parent.person.documentNumber,
                            birthDate: parent.person.birthDate ? new Date(parent.person.birthDate) : null,
                            gender: parent.person.gender,
                            mobilePhone: parent.person.mobilePhone,
                            phone: parent.person.phone,
                            email: parent.person.email,
                            city: parent.person.city,
                            address: parent.person.address
                        }
                    });
                }
                this.loadingData.set(false);
            },
            error: () => this.loadingData.set(false)
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.loading.set(true);
        setTimeout(() => {
            this.loading.set(false);
            this.onSave.emit();
        }, 600);
    }

    close(): void {
        this.form.reset();
        this.onClose.emit();
    }

    isFieldInvalid(path: string): boolean {
        const ctrl = this.form.get(path);
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    get dialogTitle(): string {
        return this.isEditMode() ? 'Editar Tutor' : 'Nuevo Tutor';
    }
}
