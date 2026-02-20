// src/app/shared/components/student/student-form-dialog/student-form-dialog.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { StepperModule } from 'primeng/stepper';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

// Services
import { StudentsService } from '../../../../core/services/conf/students.service';
import { AcademicsService } from '../../../../core/services/conf/academics.service';

// Mock types
import { BranchMock, MOCK_BRANCHES } from '../../../../shared/data/company.mock';
import { GradeMock, SectionMock } from '../../../data/academic.mock';
import { BLOOD_TYPE_OPTIONS, DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS } from '../../../../core/models/enums/person.enum';
import { RELATIONSHIP_OPTIONS, STUDENT_STATUS_OPTIONS } from '../../../../core/models/enums/student.enum';

// Enums / opciones

@Component({
    selector: 'app-student-form-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, TextareaModule, StepperModule, SkeletonModule, DividerModule],
    templateUrl: './student-form-dialog.component.html',
    styleUrl: './student-form-dialog.component.scss'
})
export class StudentFormDialogComponent implements OnChanges {
    /** Si es null → modo CREAR; si tiene valor → modo EDITAR */
    @Input() studentId: number | null = null;
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    isEditMode = signal(false);
    loading = signal(false);
    loadingData = signal(false);
    activeStep = signal(0);

    // Datos para dropdowns
    grades = signal<GradeMock[]>([]);
    sections = signal<SectionMock[]>([]);
    branches = signal<BranchMock[]>([]);

    // Opciones enum
    documentTypeOptions = DOCUMENT_TYPE_OPTIONS;
    genderOptions = GENDER_OPTIONS;
    bloodTypeOptions = BLOOD_TYPE_OPTIONS;
    statusOptions = STUDENT_STATUS_OPTIONS;
    relationshipOptions = RELATIONSHIP_OPTIONS;

    constructor(
        private fb: FormBuilder,
        private studentsService: StudentsService,
        private academicsService: AcademicsService
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
        this.loadDropdowns();

        if (this.studentId) {
            this.isEditMode.set(true);
            this.loadStudent(this.studentId);
        } else {
            this.isEditMode.set(false);
            this.form.reset();
            this.form.patchValue({
                status: 'ACTIVE',
                enrollmentDate: new Date(),
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
                bloodType: [null],
                phone: [''],
                mobilePhone: [''],
                email: ['', Validators.email],
                city: [''],
                address: ['']
            }),
            enrollmentNumber: ['', Validators.required],
            enrollmentDate: [new Date(), Validators.required],
            status: ['ACTIVE', Validators.required],
            idBranch: [null],
            idCurrentGrade: [null],
            idCurrentSection: [null],
            emergencyContactName: [''],
            emergencyContactPhone: [''],
            emergencyContactRelationship: [null],
            medicalObservations: ['']
        });

        // Cascade grade → section
        this.form.get('idCurrentGrade')?.valueChanges.subscribe((idGrade) => {
            this.form.get('idCurrentSection')?.reset(null);
            if (idGrade) this.loadSections(idGrade);
            else this.sections.set([]);
        });
    }

    private loadDropdowns(): void {
        this.academicsService.getGrades().subscribe((g) => this.grades.set(g));
        // Branches desde mock directo (no hay servicio dedicado aún)
        this.branches.set(MOCK_BRANCHES);
    }

    private loadSections(idGrade: number): void {
        this.academicsService.getSections(idGrade).subscribe((s) => this.sections.set(s));
    }

    private loadStudent(id: number): void {
        this.loadingData.set(true);
        this.studentsService.getById(id).subscribe({
            next: (student) => {
                if (student) {
                    this.form.patchValue({
                        enrollmentNumber: student.enrollmentNumber,
                        enrollmentDate: new Date(student.enrollmentDate),
                        status: student.status,
                        idBranch: student.idBranch,
                        idCurrentGrade: student.idCurrentGrade,
                        idCurrentSection: student.idCurrentSection,
                        emergencyContactName: student.emergencyContactName,
                        emergencyContactPhone: student.emergencyContactPhone,
                        emergencyContactRelationship: student.emergencyContactRelationship,
                        medicalObservations: student.medicalObservations,
                        person: {
                            firstName: student.person.firstName,
                            lastName: student.person.lastName,
                            documentType: student.person.documentType,
                            documentNumber: student.person.documentNumber,
                            birthDate: student.person.birthDate ? new Date(student.person.birthDate) : null,
                            gender: student.person.gender,
                            bloodType: student.person.bloodType,
                            phone: student.person.phone,
                            mobilePhone: student.person.mobilePhone,
                            email: student.person.email,
                            city: student.person.city,
                            address: student.person.address
                        }
                    });
                    if (student.idCurrentGrade) this.loadSections(student.idCurrentGrade);
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
        // Simular guardado (DEMO)
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
        return this.isEditMode() ? 'Editar Estudiante' : 'Nuevo Estudiante';
    }

    get dialogSubtitle(): string {
        return this.isEditMode() ? 'Actualice los datos del estudiante' : 'Complete los datos para registrar un nuevo estudiante';
    }
}
