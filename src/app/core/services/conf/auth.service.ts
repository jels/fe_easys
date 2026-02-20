import { Injectable } from '@angular/core';
import { Login } from '../../models/Login';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authData: Login | null = null;
    private storageKey = 'usr';

    constructor() {
        this.loadFromLocalStorage();
    }

    private loadFromLocalStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.authData = JSON.parse(stored);
            } catch {
                this.authData = null;
            }
        }
    }

    getLocalStorageUser() {
        this.loadFromLocalStorage();
    }

    private saveToLocalStorage() {
        if (this.authData) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.authData));
        } else {
            localStorage.removeItem(this.storageKey);
        }
    }

    // Usar este método al hacer login
    setAuthData(data: Login) {
        this.authData = data;
        this.saveToLocalStorage();
    }

    // Usar este método para limpiar sesión
    clearAuthData() {
        this.authData = null;
        localStorage.removeItem(this.storageKey);
    }

    // Getters seguros
    get token(): string | null {
        return this.authData?.token ?? null;
    }

    get username(): string | null {
        return this.authData?.username ?? null;
    }

    get password(): string | null {
        return this.authData?.password ?? null;
    }

    get tipo(): number | null {
        return this.authData?.type ?? null;
    }

    isLoggedIn(): boolean {
        return !!this.token;
    }

    // Único método que usás luego del login
    updateUserAfterLogin(user: Login) {
        this.setAuthData(user); // Actualiza localStorage + authData
    }

    // Si solo querés actualizar el token
    setToken(newToken: string) {
        if (this.authData) {
            this.authData.token = newToken;
            this.saveToLocalStorage();
        }
    }
}
