// src/app/shared/components/parent/parent-form-dialog/parent-form-dialog.component.ts

import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

// Services
import { ParentsService } from '../../../../core/services/api/parents.service';
import { AuthService } from '../../../../core/services/api/auth.service';

// Models
import { CreateParentRequest, UpdateParentRequest } from '../../../../core/models/parent.models';

// Enums
import { DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS } from '../../../../core/models/enums/person.enum';

@Component({
    selector: 'app-parent-form-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, ToggleSwitchModule, SkeletonModule, DividerModule],
    templateUrl: './parent-form-dialog.component.html',
    styleUrl: './parent-form-dialog.component.scss'
})
export class ParentFormDialogComponent implements OnChanges, OnDestroy {
    @Input() parentId: number | null = null;
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    isEditMode = signal(false);
    loading = signal(false);
    loadingData = signal(false);

    readonly documentTypeOptions = DOCUMENT_TYPE_OPTIONS;
    readonly genderOptions = GENDER_OPTIONS;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private parentsService: ParentsService,
        private authService: AuthService
    ) {
        this.buildForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true) {
            this.onDialogOpen();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Inicialización ────────────────────────────────────────────────────────

    private onDialogOpen(): void {
        if (this.parentId) {
            this.isEditMode.set(true);
            this.loadParent(this.parentId);
        } else {
            this.isEditMode.set(false);
            this.form.reset();
            this.form.patchValue({
                person: { documentType: 'CI' },
                isFinancialResponsible: false
            });
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
        this.parentsService
            .getById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        const p = res.data;
                        this.form.patchValue({
                            occupation: p.occupation,
                            workplace: p.workplace,
                            workPhone: p.workPhone,
                            isFinancialResponsible: p.isFinancialResponsible,
                            person: {
                                firstName: p.person.firstName,
                                lastName: p.person.lastName,
                                documentType: p.person.documentType,
                                documentNumber: p.person.documentNumber,
                                birthDate: p.person.birthDate ? new Date(p.person.birthDate) : null,
                                gender: p.person.gender,
                                mobilePhone: p.person.mobilePhone,
                                phone: p.person.phone,
                                email: p.person.email,
                                city: p.person.city,
                                address: p.person.address
                            }
                        });
                    }
                    this.loadingData.set(false);
                },
                error: () => this.loadingData.set(false)
            });
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.loading.set(true);
        this.isEditMode() ? this.update() : this.create();
    }

    private create(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        const v = this.form.value;
        const request: CreateParentRequest = {
            idCompany,
            occupation: v.occupation || undefined,
            workplace: v.workplace || undefined,
            workPhone: v.workPhone || undefined,
            isFinancialResponsible: v.isFinancialResponsible ?? false,
            personData: {
                idCompany,
                firstName: v.person.firstName,
                lastName: v.person.lastName,
                documentType: v.person.documentType,
                documentNumber: v.person.documentNumber,
                birthDate: v.person.birthDate ? this.toIsoDate(v.person.birthDate) : undefined,
                gender: v.person.gender || undefined,
                mobilePhone: v.person.mobilePhone || undefined,
                phone: v.person.phone || undefined,
                email: v.person.email || undefined,
                city: v.person.city || undefined,
                address: v.person.address || undefined
            }
        };

        this.parentsService
            .create(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.loading.set(false);
                    if (res.success) this.onSave.emit();
                },
                error: () => this.loading.set(false)
            });
    }

    private update(): void {
        const v = this.form.value;
        const request: UpdateParentRequest = {
            firstName: v.person.firstName,
            lastName: v.person.lastName,
            documentType: v.person.documentType,
            documentNumber: v.person.documentNumber,
            birthDate: v.person.birthDate ? this.toIsoDate(v.person.birthDate) : undefined,
            gender: v.person.gender || undefined,
            mobilePhone: v.person.mobilePhone || undefined,
            phone: v.person.phone || undefined,
            email: v.person.email || undefined,
            city: v.person.city || undefined,
            address: v.person.address || undefined,
            occupation: v.occupation || undefined,
            workplace: v.workplace || undefined,
            workPhone: v.workPhone || undefined,
            isFinancialResponsible: v.isFinancialResponsible ?? false
        };

        this.parentsService
            .update(this.parentId!, request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.loading.set(false);
                    if (res.success) this.onSave.emit();
                },
                error: () => this.loading.set(false)
            });
    }

    // ── UI helpers ────────────────────────────────────────────────────────────

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

    private toIsoDate(date: Date | string): string {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().split('T')[0];
    }
}
