import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { SkeletonModule } from 'primeng/skeleton';

// Services & Models
import { StaffApiService } from '../../../../core/services/api/staff-api.service';
import { StaffDTO } from '../../../../core/models/dto/staff.dto';
import { NotificationService } from '../../../../shared/components/notification-modal/notification.service';

@Component({
    selector: 'app-personnel-detail',
    standalone: true,
    imports: [CommonModule, ButtonModule, TagModule, CardModule, DividerModule, TabsModule, SkeletonModule],
    templateUrl: './personnel-detail.component.html',
    styleUrl: './personnel-detail.component.scss'
})
export class PersonnelDetailComponent implements OnInit {
    staff = signal<StaffDTO | null>(null);
    loading = signal(true);
    staffId!: number;

    constructor(
        private staffApi: StaffApiService,
        private router: Router,
        private route: ActivatedRoute,
        private notifier: NotificationService
    ) {}

    ngOnInit(): void {
        this.staffId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadStaff();
    }

    loadStaff(): void {
        this.staffApi.getById(this.staffId).subscribe({
            next: (res) => {
                if (res.success) this.staff.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                this.notifier.error('Error al cargar el registro');
                this.loading.set(false);
                this.router.navigate(['/sys/personal']);
            }
        });
    }

    goToEdit(): void {
        this.router.navigate(['/sys/personal/editar', this.staffId]);
    }

    goBack(): void {
        this.router.navigate(['/sys/personal']);
    }

    getFullName(): string {
        const s = this.staff();
        if (!s?.person) return s?.fullName ?? '';
        return `${s.person.firstName} ${s.person.lastName}`;
    }

    getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'secondary' | 'danger' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'secondary' | 'danger' | 'contrast'> = {
            TEACHER: 'info',
            ADMINISTRATIVE: 'success',
            SUPPORT: 'warn',
            DIRECTOR: 'contrast'
        };
        return map[type] ?? 'secondary';
    }

    getTypeLabel(type: string): string {
        const map: Record<string, string> = {
            TEACHER: 'Docente',
            ADMINISTRATIVE: 'Administrativo',
            SUPPORT: 'Apoyo',
            DIRECTOR: 'Director'
        };
        return map[type] ?? type;
    }

    getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = {
            ACTIVE: 'success',
            INACTIVE: 'danger',
            ON_LEAVE: 'warn',
            TERMINATED: 'secondary'
        };
        return map[status] ?? 'secondary';
    }

    getStatusLabel(status: string): string {
        const map: Record<string, string> = {
            ACTIVE: 'Activo',
            INACTIVE: 'Inactivo',
            ON_LEAVE: 'De licencia',
            TERMINATED: 'Desvinculado'
        };
        return map[status] ?? status;
    }
}
