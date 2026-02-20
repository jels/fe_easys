// src/app/shared/components/staff/staff-form-dialog/staff-form-dialog.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { StepperModule } from 'primeng/stepper';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

import { StaffService } from '../../../../core/services/conf/staff.service';
import { DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS } from '../../../../core/models/enums/person.enum';

@Component({
    selector: 'app-staff-form-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, InputNumberModule, TextareaModule, StepperModule, SkeletonModule, DividerModule],
    templateUrl: './staff-form-dialog.component.html',
    styleUrl: './staff-form-dialog.component.scss'
})
export class StaffFormDialogComponent implements OnChanges {
    @Input() staffId: number | null = null;
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    isEditMode = signal(false);
    loading = signal(false);
    loadingData = signal(false);
    activeStep = signal(0);

    documentTypeOptions = DOCUMENT_TYPE_OPTIONS;
    genderOptions = GENDER_OPTIONS;

    staffTypeOptions = [
        { label: 'Docente', value: 'TEACHER' },
        { label: 'Administrativo', value: 'ADMINISTRATIVE' },
        { label: 'Director', value: 'DIRECTOR' },
        { label: 'Soporte', value: 'SUPPORT' }
    ];

    statusOptions = [
        { label: 'Activo', value: 'ACTIVE' },
        { label: 'Inactivo', value: 'INACTIVE' },
        { label: 'De licencia', value: 'ON_LEAVE' }
    ];

    contractTypeOptions = [
        { label: 'Tiempo completo', value: 'FULL_TIME' },
        { label: 'Medio tiempo', value: 'PART_TIME' },
        { label: 'Por hora', value: 'HOURLY' },
        { label: 'Contratado', value: 'CONTRACTOR' }
    ];

    constructor(
        private fb: FormBuilder,
        private staffService: StaffService
    ) {
        this.buildForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true) {
            this.onDialogOpen();
        }
    }

    private onDialogOpen(): void {
        this.activeStep.set(0);
        if (this.staffId) {
            this.isEditMode.set(true);
            this.loadStaff(this.staffId);
        } else {
            this.isEditMode.set(false);
            this.form.reset();
            this.form.patchValue({
                status: 'ACTIVE',
                staffType: 'TEACHER',
                hireDate: new Date(),
                person: { documentType: 'CI' }
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
            // Datos laborales
            employeeNumber: ['', Validators.required],
            staffType: ['TEACHER', Validators.required],
            position: [''],
            department: [''],
            specialization: [''],
            status: ['ACTIVE', Validators.required],
            hireDate: [new Date(), Validators.required],
            idBranch: [null],
            // Contrato / salario
            contractType: [null],
            salary: [null],
            workSchedule: [''],
            contractNotes: ['']
        });
    }

    private loadStaff(id: number): void {
        this.loadingData.set(true);
        this.staffService.getById(id).subscribe({
            next: (member) => {
                if (member) {
                    this.form.patchValue({
                        employeeNumber: member.employeeNumber,
                        staffType: member.staffType,
                        position: member.position,
                        department: member.department,
                        specialization: member.specialization,
                        status: member.status,
                        hireDate: new Date(member.hireDate),
                        idBranch: member.idBranch,
                        //contractType: member.contractType,
                        salary: member.salary,
                        //workSchedule: member.workSchedule,
                        // contractNotes: member.contractNotes,
                        person: {
                            firstName: member.person.firstName,
                            lastName: member.person.lastName,
                            documentType: member.person.documentType,
                            documentNumber: member.person.documentNumber,
                            birthDate: member.person.birthDate ? new Date(member.person.birthDate) : null,
                            gender: member.person.gender,
                            mobilePhone: member.person.mobilePhone,
                            phone: member.person.phone,
                            email: member.person.email,
                            city: member.person.city,
                            address: member.person.address
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

    get isTeacher(): boolean {
        return this.form.get('staffType')?.value === 'TEACHER';
    }

    get dialogTitle(): string {
        return this.isEditMode() ? 'Editar Empleado' : 'Nuevo Empleado';
    }
}
