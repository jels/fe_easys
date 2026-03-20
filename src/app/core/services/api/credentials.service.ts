import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { QrCodeResponse, GenerateQrRequest } from '../../models/qr.models';

export type CredentialPersonType = 'STUDENT' | 'STAFF';

@Injectable({ providedIn: 'root' })
export class CredentialsService {
    private readonly API = `${environment.apiUrl}qr`;

    constructor(private http: HttpClient) {}

    // GET /api/v1/qr/credentials?personType=&idPerson=
    getCredential(personType: CredentialPersonType, idPerson: number): Observable<ApiResponse<QrCodeResponse>> {
        const params = new HttpParams().set('personType', personType).set('idPerson', idPerson);
        return this.http.get<ApiResponse<QrCodeResponse>>(`${this.API}/credentials`, { params });
    }

    // POST /api/v1/qr/credentials/generate
    // Genera o regenera credencial — invalida el token anterior
    generateCredential(request: GenerateQrRequest): Observable<ApiResponse<QrCodeResponse>> {
        return this.http.post<ApiResponse<QrCodeResponse>>(`${this.API}/credentials/generate`, request);
    }
}
