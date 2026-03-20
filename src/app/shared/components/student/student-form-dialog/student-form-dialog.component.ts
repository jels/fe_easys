// src/app/shared/components/student/student-form-dialog/student-form-dialog.component.ts

import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
import { StudentsService } from '../../../../core/services/api/students.service';
import { AcademicsService } from '../../../../core/services/api/academics.service';
import { AuthService } from '../../../../core/services/api/auth.service';

// Models
import { GradeResponse, SectionResponse } from '../../../../core/models/academic.models';
import { BranchResponse } from '../../../../core/models/settings.models';
import { ApiResponse } from '../../../../core/models/auth.models';

// Enums
import { BLOOD_TYPE_OPTIONS, DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS } from '../../../../core/models/enums/person.enum';
import { RELATIONSHIP_OPTIONS, STUDENT_STATUS_OPTIONS } from '../../../../core/models/enums/student.enum';

import { environment } from '../../../../../environments/environment';
import { CreateStudentRequest, UpdateStudentRequest } from '../../../../core/models/student.dto';

@Component({
    selector: 'app-student-form-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, TextareaModule, StepperModule, SkeletonModule, DividerModule],
    templateUrl: './student-form-dialog.component.html',
    styleUrl: './student-form-dialog.component.scss'
})
export class StudentFormDialogComponent implements OnChanges, OnDestroy {
    @Input() studentId: number | null = null;
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    isEditMode = signal(false);
    loading = signal(false);
    loadingData = signal(false);
    activeStep = signal(0);

    // Dropdowns
    grades = signal<GradeResponse[]>([]);
    sections = signal<SectionResponse[]>([]);
    branches = signal<BranchResponse[]>([]); // ← cargado desde el backend

    // Enums
    documentTypeOptions = DOCUMENT_TYPE_OPTIONS;
    genderOptions = GENDER_OPTIONS;
    bloodTypeOptions = BLOOD_TYPE_OPTIONS;
    statusOptions = STUDENT_STATUS_OPTIONS;
    relationshipOptions = RELATIONSHIP_OPTIONS;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private http: HttpClient, // solo para branches (hasta tener SettingsService)
        private studentsService: StudentsService,
        private academicsService: AcademicsService,
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
            enrollmentNumber: [''],
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

        // Cascade grado → sección
        this.form
            .get('idCurrentGrade')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((idGrade) => {
                this.form.get('idCurrentSection')?.reset(null);
                if (idGrade) this.loadSections(idGrade);
                else this.sections.set([]);
            });
    }

    // ── Data loading ──────────────────────────────────────────────────────────

    private loadDropdowns(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        // Grados
        this.academicsService
            .getGrades(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.grades.set(res.data ?? []);
                }
            });

        // Sucursales — GET /api/v1/settings/branches?idCompany=
        const params = new HttpParams().set('idCompany', idCompany);
        this.http
            .get<ApiResponse<BranchResponse[]>>(`${environment.apiUrl}settings/branches`, { params })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.branches.set(res.data ?? []);
                }
            });
    }

    private loadSections(idGrade: number): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        this.academicsService
            .getSections(idCompany, { idGrade })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.sections.set(res.data ?? []);
                }
            });
    }

    private loadStudent(id: number): void {
        this.loadingData.set(true);

        this.studentsService
            .getById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        const s = res.data;
                        this.form.patchValue({
                            enrollmentNumber: s.enrollmentNumber,
                            enrollmentDate: new Date(s.enrollmentDate),
                            status: s.status,
                            idBranch: s.idBranch,
                            idCurrentGrade: s.idCurrentGrade,
                            idCurrentSection: s.idCurrentSection,
                            emergencyContactName: s.emergencyContactName,
                            emergencyContactPhone: s.emergencyContactPhone,
                            emergencyContactRelationship: s.emergencyContactRelationship,
                            medicalObservations: s.medicalObservations,
                            person: {
                                firstName: s.person.firstName,
                                lastName: s.person.lastName,
                                documentType: s.person.documentType,
                                documentNumber: s.person.documentNumber,
                                birthDate: s.person.birthDate ? new Date(s.person.birthDate) : null,
                                gender: s.person.gender,
                                bloodType: s.person.bloodType,
                                phone: s.person.phone,
                                mobilePhone: s.person.mobilePhone,
                                email: s.person.email,
                                city: s.person.city,
                                address: s.person.address
                            }
                        });
                        if (s.idCurrentGrade) this.loadSections(s.idCurrentGrade);
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
        const request: CreateStudentRequest = {
            idCompany,
            idBranch: v.idBranch || undefined,
            idCurrentGrade: v.idCurrentGrade || undefined,
            idCurrentSection: v.idCurrentSection || undefined,
            enrollmentNumber: v.enrollmentNumber || undefined,
            enrollmentDate: this.toIsoDate(v.enrollmentDate),
            emergencyContactName: v.emergencyContactName || undefined,
            emergencyContactPhone: v.emergencyContactPhone || undefined,
            emergencyContactRelationship: v.emergencyContactRelationship || undefined,
            medicalObservations: v.medicalObservations || undefined,
            personData: {
                idCompany,
                firstName: v.person.firstName,
                lastName: v.person.lastName,
                documentType: v.person.documentType,
                documentNumber: v.person.documentNumber,
                birthDate: v.person.birthDate ? this.toIsoDate(v.person.birthDate) : undefined,
                gender: v.person.gender || undefined,
                bloodType: v.person.bloodType || undefined,
                phone: v.person.phone || undefined,
                mobilePhone: v.person.mobilePhone || undefined,
                email: v.person.email || undefined,
                city: v.person.city || undefined,
                address: v.person.address || undefined
            }
        };

        this.studentsService
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
        const request: UpdateStudentRequest = {
            firstName: v.person.firstName,
            lastName: v.person.lastName,
            documentType: v.person.documentType,
            documentNumber: v.person.documentNumber,
            birthDate: v.person.birthDate ? this.toIsoDate(v.person.birthDate) : undefined,
            gender: v.person.gender || undefined,
            bloodType: v.person.bloodType || undefined,
            phone: v.person.phone || undefined,
            mobilePhone: v.person.mobilePhone || undefined,
            email: v.person.email || undefined,
            city: v.person.city || undefined,
            address: v.person.address || undefined,
            idBranch: v.idBranch || undefined,
            idCurrentGrade: v.idCurrentGrade || undefined,
            idCurrentSection: v.idCurrentSection || undefined,
            status: v.status,
            emergencyContactName: v.emergencyContactName || undefined,
            emergencyContactPhone: v.emergencyContactPhone || undefined,
            emergencyContactRelationship: v.emergencyContactRelationship || undefined,
            medicalObservations: v.medicalObservations || undefined
        };

        this.studentsService
            .update(this.studentId!, request)
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
        return this.isEditMode() ? 'Editar Estudiante' : 'Nuevo Estudiante';
    }

    get dialogSubtitle(): string {
        return this.isEditMode() ? 'Actualice los datos del estudiante' : 'Complete los datos para registrar un nuevo estudiante';
    }

    private toIsoDate(date: Date | string): string {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().split('T')[0];
    }
}
