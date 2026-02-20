import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { StepperModule } from 'primeng/stepper';
import { SkeletonModule } from 'primeng/skeleton';

// Services & Models
import { StaffApiService } from '../../../../core/services/api/staff-api.service';
import { AcademicsApiService } from '../../../../core/services/api/academics-api.service';
import { StaffDTO, StaffRequest } from '../../../../core/models/dto/staff.dto';
import { BranchDTO } from '../../../../core/models/dto/academic.dto';
import { NotificationService } from '../../../../shared/components/notification-modal/notification.service';
import { BLOOD_TYPE_OPTIONS, DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS } from '../../../../core/models/enums/person.enum';
import { STAFF_STATUS_OPTIONS, STAFF_TYPE_OPTIONS } from '../../../../core/models/enums/staff.enum';

@Component({
    selector: 'app-personnel-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule, DatePickerModule, InputNumberModule, CardModule, DividerModule, StepperModule, SkeletonModule],
    templateUrl: './personnel-form.component.html',
    styleUrl: './personnel-form.component.scss'
})
export class PersonnelFormComponent implements OnInit {
    form!: FormGroup;
    isEditMode = signal(false);
    loading = signal(false);
    loadingData = signal(true);
    staffId = signal<number | null>(null);

    branches = signal<BranchDTO[]>([]);

    documentTypeOptions = DOCUMENT_TYPE_OPTIONS;
    genderOptions = GENDER_OPTIONS;
    bloodTypeOptions = BLOOD_TYPE_OPTIONS;
    staffTypeOptions = STAFF_TYPE_OPTIONS;
    staffStatusOptions = STAFF_STATUS_OPTIONS;

    activeStep = signal(0);

    constructor(
        private fb: FormBuilder,
        private staffApi: StaffApiService,
        private academicsApi: AcademicsApiService,
        private router: Router,
        private route: ActivatedRoute,
        private notifier: NotificationService
    ) {}

    ngOnInit(): void {
        this.buildForm();
        this.loadDropdowns();

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.staffId.set(Number(id));
            this.loadStaff(Number(id));
        } else {
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
                address: [''],
                city: [''],
                phone: [''],
                mobilePhone: [''],
                email: ['', Validators.email]
            }),
            employeeNumber: ['', Validators.required],
            hireDate: [new Date(), Validators.required],
            staffType: ['TEACHER', Validators.required],
            position: [''],
            department: [''],
            specialization: [''],
            salary: [null],
            status: ['ACTIVE', Validators.required],
            terminationDate: [null],
            idBranch: [null]
        });
    }

    private loadDropdowns(): void {
        this.academicsApi.getAllBranches().subscribe((res) => {
            if (res.success) this.branches.set(res.data);
        });
    }

    private loadStaff(id: number): void {
        this.loadingData.set(true);
        this.staffApi.getById(id).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.patchForm(res.data);
                }
                this.loadingData.set(false);
            },
            error: () => {
                this.notifier.error('Error al cargar el registro');
                this.loadingData.set(false);
                this.router.navigate(['/sys/personal']);
            }
        });
    }

    private patchForm(staff: StaffDTO): void {
        this.form.patchValue({
            employeeNumber: staff.employeeNumber,
            hireDate: staff.hireDate ? new Date(staff.hireDate) : null,
            staffType: staff.staffType,
            position: staff.position,
            department: staff.department,
            specialization: staff.specialization,
            salary: staff.salary,
            status: staff.status,
            terminationDate: staff.terminationDate ? new Date(staff.terminationDate) : null,
            idBranch: staff.idBranch,
            person: {
                firstName: staff.person?.firstName,
                lastName: staff.person?.lastName,
                documentType: staff.person?.documentType,
                documentNumber: staff.person?.documentNumber,
                birthDate: staff.person?.birthDate ? new Date(staff.person.birthDate) : null,
                gender: staff.person?.gender,
                bloodType: staff.person?.bloodType,
                address: staff.person?.address,
                city: staff.person?.city,
                phone: staff.person?.phone,
                mobilePhone: staff.person?.mobilePhone,
                email: staff.person?.email
            }
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.notifier.warning('Por favor, complete todos los campos requeridos');
            return;
        }

        this.loading.set(true);
        const rawValue = this.form.getRawValue();

        const request: StaffRequest = {
            ...rawValue,
            hireDate: this.formatDate(rawValue.hireDate),
            terminationDate: rawValue.terminationDate ? this.formatDate(rawValue.terminationDate) : undefined,
            idCompany: this.getCompanyId(),
            person: {
                ...rawValue.person,
                idCompany: this.getCompanyId(),
                birthDate: rawValue.person.birthDate ? this.formatDate(rawValue.person.birthDate) : undefined
            }
        };

        const operation = this.isEditMode() ? this.staffApi.update(this.staffId()!, request) : this.staffApi.create(request);

        operation.subscribe({
            next: (res) => {
                if (res.success) {
                    this.notifier.success(res.message || (this.isEditMode() ? 'Personal actualizado' : 'Personal registrado'));
                    this.router.navigate(['/sys/personal']);
                }
                this.loading.set(false);
            },
            error: (err) => {
                this.notifier.error(err.error?.message || 'Error al guardar');
                this.loading.set(false);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/sys/personal']);
    }

    isFieldInvalid(path: string): boolean {
        const control = this.form.get(path);
        return !!(control?.invalid && control?.touched);
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    private getCompanyId(): number {
        const user = JSON.parse(localStorage.getItem('user_info') || '{}');
        return user.idCompany ?? 1;
    }
}
