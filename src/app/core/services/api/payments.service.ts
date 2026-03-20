import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { PaymentMethodResponse, PaymentConceptResponse, StudentPaymentPlanResponse, PaymentInstallmentResponse, PaymentResponse, PaymentStatsResponse } from '../../models/operations.models';
import { PageResponse } from '../../models/student.dto';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
    private readonly API = `${environment.apiUrl}payments`;

    constructor(private http: HttpClient) {}

    // ── Methods ───────────────────────────────────────────────────────────────

    getMethods(idCompany: number): Observable<ApiResponse<PaymentMethodResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<PaymentMethodResponse[]>>(`${this.API}/methods`, { params });
    }

    createMethod(request: any): Observable<ApiResponse<PaymentMethodResponse>> {
        return this.http.post<ApiResponse<PaymentMethodResponse>>(`${this.API}/methods`, request);
    }

    // ── Concepts ──────────────────────────────────────────────────────────────

    getConcepts(idCompany: number, category?: string): Observable<ApiResponse<PaymentConceptResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (category) params = params.set('category', category);
        return this.http.get<ApiResponse<PaymentConceptResponse[]>>(`${this.API}/concepts`, { params });
    }

    createConcept(request: any): Observable<ApiResponse<PaymentConceptResponse>> {
        return this.http.post<ApiResponse<PaymentConceptResponse>>(`${this.API}/concepts`, request);
    }

    toggleConceptActive(idConcept: number, isActive: boolean): Observable<ApiResponse<PaymentConceptResponse>> {
        const params = new HttpParams().set('isActive', isActive);
        return this.http.patch<ApiResponse<PaymentConceptResponse>>(`${this.API}/concepts/${idConcept}/toggle-active`, null, { params });
    }

    // ── Plans ─────────────────────────────────────────────────────────────────

    getPlansByStudent(idStudent: number): Observable<ApiResponse<StudentPaymentPlanResponse[]>> {
        return this.http.get<ApiResponse<StudentPaymentPlanResponse[]>>(`${this.API}/plans/by-student/${idStudent}`);
    }

    createPlan(request: any): Observable<ApiResponse<StudentPaymentPlanResponse>> {
        return this.http.post<ApiResponse<StudentPaymentPlanResponse>>(`${this.API}/plans`, request);
    }

    // ── Installments ──────────────────────────────────────────────────────────

    getInstallmentsByPlan(idStudentPaymentPlan: number): Observable<ApiResponse<PaymentInstallmentResponse[]>> {
        return this.http.get<ApiResponse<PaymentInstallmentResponse[]>>(`${this.API}/installments/by-plan/${idStudentPaymentPlan}`);
    }

    // GET /api/v1/payments/installments/by-student/{idStudent}
    getInstallmentsByStudent(idStudent: number): Observable<ApiResponse<PaymentInstallmentResponse[]>> {
        return this.http.get<ApiResponse<PaymentInstallmentResponse[]>>(`${this.API}/installments/by-student/${idStudent}`);
    }

    getOverdueInstallments(idCompany: number): Observable<ApiResponse<PaymentInstallmentResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<PaymentInstallmentResponse[]>>(`${this.API}/installments/overdue`, { params });
    }

    getPendingInstallments(idCompany: number): Observable<ApiResponse<PaymentInstallmentResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<PaymentInstallmentResponse[]>>(`${this.API}/installments/pending`, { params });
    }

    // ── Payments ──────────────────────────────────────────────────────────────

    getPayments(idCompany: number, filter?: { idStudent?: number; dateFrom?: string; dateTo?: string; search?: string; page?: number; size?: number }): Observable<ApiResponse<PageResponse<PaymentResponse>>> {
        let params = new HttpParams()
            .set('idCompany', idCompany)
            .set('page', filter?.page ?? 0)
            .set('size', filter?.size ?? 20);
        if (filter?.idStudent) params = params.set('idStudent', filter.idStudent);
        if (filter?.dateFrom) params = params.set('dateFrom', filter.dateFrom);
        if (filter?.dateTo) params = params.set('dateTo', filter.dateTo);
        if (filter?.search) params = params.set('search', filter.search);
        return this.http.get<ApiResponse<PageResponse<PaymentResponse>>>(this.API, { params });
    }

    getPaymentById(idPayment: number): Observable<ApiResponse<PaymentResponse>> {
        return this.http.get<ApiResponse<PaymentResponse>>(`${this.API}/${idPayment}`);
    }

    registerPayment(request: any): Observable<ApiResponse<PaymentResponse>> {
        return this.http.post<ApiResponse<PaymentResponse>>(this.API, request);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    getStats(idCompany: number): Observable<ApiResponse<PaymentStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<PaymentStatsResponse>>(`${this.API}/stats`, { params });
    }
}
