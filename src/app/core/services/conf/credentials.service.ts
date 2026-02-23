// src/app/core/services/conf/credentials.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MOCK_STUDENTS } from '../../../shared/data/people.mock';
import { MOCK_STAFF } from '../../../shared/data/staff.mock';
import { MOCK_FILES, FileMock } from '../../../shared/data/files.mock';
import { MOCK_SCHOOL_YEARS } from '../../../shared/data/academic.mock';

export type CredentialPersonType = 'STUDENT' | 'STAFF';

export interface CredentialPerson {
    idPerson: number;
    personType: CredentialPersonType;
    fullName: string;
    displayLabel: string; // Grado/Curso para alumno, Cargo para staff
    photoUrl?: string;
    accessToken?: string;
    credentialIssuedAt?: string;
    isActive: boolean;
}

export interface CredentialData {
    person: CredentialPerson;
    institution: string;
    activeYear: string;
    accessToken: string; // token vigente (ya generado o recién generado)
    isNew: boolean; // true si se acaba de generar (token nuevo)
}

@Injectable({ providedIn: 'root' })
export class CredentialsService {
    // Tokens en memoria (simulan la columna access_token en BD)
    private _studentTokens = new Map<number, { token: string; issuedAt: string }>();
    private _staffTokens = new Map<number, { token: string; issuedAt: string }>();

    constructor() {
        // ── Tokens demo pre-cargados ──────────────────────────────────────────
        // Permiten probar el escáner QR sin necesidad de generar credenciales primero.
        // Formato: STU-<id_hex>-<ts_hex>-<rand>
        // Estos tokens coinciden con los QR que se mostrarán en la vista de credenciales
        // al abrir la app por primera vez.
        const DEMO_STUDENT_TOKENS: { id: number; token: string }[] = [
            { id: 1, token: 'STU-000001-demo0001-a1b2' },
            { id: 2, token: 'STU-000002-demo0001-c3d4' },
            { id: 3, token: 'STU-000003-demo0001-e5f6' },
            { id: 4, token: 'STU-000004-demo0001-g7h8' },
            { id: 5, token: 'STU-000005-demo0001-i9j0' },
            { id: 6, token: 'STU-000006-demo0001-k1l2' },
            { id: 7, token: 'STU-000007-demo0001-m3n4' },
            { id: 8, token: 'STU-000008-demo0001-o5p6' }
        ];
        const DEMO_STAFF_TOKENS: { id: number; token: string }[] = [
            { id: 1, token: 'STA-000001-demo0001-q7r8' },
            { id: 2, token: 'STA-000002-demo0001-s9t0' },
            { id: 3, token: 'STA-000003-demo0001-u1v2' },
            { id: 4, token: 'STA-000004-demo0001-w3x4' },
            { id: 5, token: 'STA-000005-demo0001-y5z6' }
        ];
        const demoDate = '2025-02-01T08:00:00.000Z';

        DEMO_STUDENT_TOKENS.forEach((d) => this._studentTokens.set(d.id, { token: d.token, issuedAt: demoDate }));
        DEMO_STAFF_TOKENS.forEach((d) => this._staffTokens.set(d.id, { token: d.token, issuedAt: demoDate }));

        // También cargar tokens personalizados si los mocks los traen definidos
        MOCK_STUDENTS.forEach((s) => {
            if ((s as any).accessToken) {
                this._studentTokens.set(s.idStudent, {
                    token: (s as any).accessToken,
                    issuedAt: (s as any).credentialIssuedAt ?? new Date().toISOString()
                });
            }
        });
        MOCK_STAFF.forEach((s) => {
            if ((s as any).accessToken) {
                this._staffTokens.set(s.idStaff, {
                    token: (s as any).accessToken,
                    issuedAt: (s as any).credentialIssuedAt ?? new Date().toISOString()
                });
            }
        });
    }

    // ── Búsqueda de personas ──────────────────────────────────────────────────

    search(query: string, type: CredentialPersonType | 'ALL' = 'ALL'): Observable<CredentialPerson[]> {
        const q = query.toLowerCase().trim();
        const results: CredentialPerson[] = [];

        if (type === 'STUDENT' || type === 'ALL') {
            MOCK_STUDENTS.filter((s) => s.isActive && (!q || s.fullName.toLowerCase().includes(q) || String(s.idStudent).includes(q))).forEach((s) => {
                const tokenData = this._studentTokens.get(s.idStudent);
                results.push({
                    idPerson: s.idStudent,
                    personType: 'STUDENT',
                    fullName: s.fullName,
                    displayLabel: `${s.gradeName ?? ''} ${s.sectionName ?? ''}`.trim(),
                    photoUrl: this.getPhotoUrl('STUDENT', s.idStudent),
                    accessToken: tokenData?.token,
                    credentialIssuedAt: tokenData?.issuedAt,
                    isActive: s.isActive
                });
            });
        }

        if (type === 'STAFF' || type === 'ALL') {
            MOCK_STAFF.filter((s) => s.isActive && (!q || s.fullName.toLowerCase().includes(q) || String(s.idStaff).includes(q))).forEach((s) => {
                const tokenData = this._staffTokens.get(s.idStaff);
                results.push({
                    idPerson: s.idStaff,
                    personType: 'STAFF',
                    fullName: s.fullName,
                    displayLabel: (s as any).position ?? (s as any).jobTitle ?? 'Personal',
                    photoUrl: this.getPhotoUrl('STAFF', s.idStaff),
                    accessToken: tokenData?.token,
                    credentialIssuedAt: tokenData?.issuedAt,
                    isActive: s.isActive
                });
            });
        }

        return of(results.slice(0, 30)).pipe(delay(300));
    }

    // ── Generar / regenerar token ─────────────────────────────────────────────

    generateCredential(person: CredentialPerson): Observable<CredentialData> {
        const newToken = this.buildToken(person.personType, person.idPerson);
        const issuedAt = new Date().toISOString();
        const activeYear = MOCK_SCHOOL_YEARS.find((y) => y.isActive)?.name ?? 'Año Lectivo 2025';

        // Guardar nuevo token (invalida el anterior)
        if (person.personType === 'STUDENT') {
            this._studentTokens.set(person.idPerson, { token: newToken, issuedAt });
        } else {
            this._staffTokens.set(person.idPerson, { token: newToken, issuedAt });
        }

        const credData: CredentialData = {
            person: {
                ...person,
                accessToken: newToken,
                credentialIssuedAt: issuedAt
            },
            institution: 'Colegio San José',
            activeYear,
            accessToken: newToken,
            isNew: true
        };

        return of(credData).pipe(delay(500));
    }

    /** Obtener credencial existente sin regenerar token */
    getCredential(person: CredentialPerson): Observable<CredentialData | null> {
        const map = person.personType === 'STUDENT' ? this._studentTokens : this._staffTokens;
        const tokenData = map.get(person.idPerson);
        if (!tokenData) return of(null);

        const activeYear = MOCK_SCHOOL_YEARS.find((y) => y.isActive)?.name ?? 'Año Lectivo 2025';
        return of({
            person: { ...person, accessToken: tokenData.token, credentialIssuedAt: tokenData.issuedAt },
            institution: 'Colegio San José',
            activeYear,
            accessToken: tokenData.token,
            isNew: false
        }).pipe(delay(200));
    }

    /** Resolver token → persona (para el escáner QR) */
    resolveToken(token: string): CredentialPerson | null {
        for (const [idStudent, data] of this._studentTokens) {
            if (data.token === token) {
                const s = MOCK_STUDENTS.find((x) => x.idStudent === idStudent);
                if (!s) return null;
                return {
                    idPerson: s.idStudent,
                    personType: 'STUDENT',
                    fullName: s.fullName,
                    displayLabel: `${s.gradeName ?? ''} ${s.sectionName ?? ''}`.trim(),
                    photoUrl: this.getPhotoUrl('STUDENT', s.idStudent),
                    accessToken: token,
                    isActive: s.isActive
                };
            }
        }
        for (const [idStaff, data] of this._staffTokens) {
            if (data.token === token) {
                const s = MOCK_STAFF.find((x) => x.idStaff === idStaff);
                if (!s) return null;
                return {
                    idPerson: s.idStaff,
                    personType: 'STAFF',
                    fullName: s.fullName,
                    displayLabel: (s as any).position ?? 'Personal',
                    photoUrl: this.getPhotoUrl('STAFF', s.idStaff),
                    accessToken: token,
                    isActive: s.isActive
                };
            }
        }
        return null;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private buildToken(type: CredentialPersonType, id: number): string {
        // Formato: STU-<id_hex>-<timestamp_hex>-<random>
        // Ejemplo: STU-000001-0196abc1-f3a9
        const prefix = type === 'STUDENT' ? 'STU' : 'STA';
        const idHex = id.toString(16).padStart(6, '0');
        const tsHex = Math.floor(Date.now() / 1000).toString(16);
        const rand = Math.random().toString(16).slice(2, 6);
        return `${prefix}-${idHex}-${tsHex}-${rand}`;
    }

    private getPhotoUrl(type: CredentialPersonType, idEntity: number): string | undefined {
        const file = MOCK_FILES.find((f) => f.entityType === type && f.idEntity === idEntity && f.isPrimary && f.isActive);
        return file?.fileUrl;
    }
}
