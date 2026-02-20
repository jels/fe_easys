// src/app/shared/services/storage.service.ts
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly SECRET_KEY = environment.storageSecretKey || 'school-access-control-2025';
    private readonly ENCRYPTED_PREFIX = 'enc_';

    constructor() {}

    /**
     * Guardar dato en localStorage
     */
    set(key: string, value: any, encrypt: boolean = false): void {
        try {
            const stringValue = JSON.stringify(value);

            if (encrypt) {
                const encrypted = this.encrypt(stringValue);
                localStorage.setItem(this.ENCRYPTED_PREFIX + key, encrypted);
            } else {
                localStorage.setItem(key, stringValue);
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Obtener dato de localStorage
     */
    get<T>(key: string, encrypted: boolean = false): T | null {
        try {
            let value: string | null;

            if (encrypted) {
                value = localStorage.getItem(this.ENCRYPTED_PREFIX + key);
                if (value) {
                    value = this.decrypt(value);
                }
            } else {
                value = localStorage.getItem(key);
            }

            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    /**
     * Eliminar dato de localStorage
     */
    remove(key: string, encrypted: boolean = false): void {
        try {
            if (encrypted) {
                localStorage.removeItem(this.ENCRYPTED_PREFIX + key);
            } else {
                localStorage.removeItem(key);
            }
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    /**
     * Limpiar todo el localStorage
     */
    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    /**
     * Verificar si existe una clave
     */
    has(key: string, encrypted: boolean = false): boolean {
        const storageKey = encrypted ? this.ENCRYPTED_PREFIX + key : key;
        return localStorage.getItem(storageKey) !== null;
    }

    /**
     * Obtener todas las claves
     */
    keys(): string[] {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                keys.push(key);
            }
        }
        return keys;
    }

    // ==================== SessionStorage ====================

    /**
     * Guardar en sessionStorage
     */
    setSession(key: string, value: any, encrypt: boolean = false): void {
        try {
            const stringValue = JSON.stringify(value);

            if (encrypt) {
                const encrypted = this.encrypt(stringValue);
                sessionStorage.setItem(this.ENCRYPTED_PREFIX + key, encrypted);
            } else {
                sessionStorage.setItem(key, stringValue);
            }
        } catch (error) {
            console.error('Error saving to sessionStorage:', error);
        }
    }

    /**
     * Obtener de sessionStorage
     */
    getSession<T>(key: string, encrypted: boolean = false): T | null {
        try {
            let value: string | null;

            if (encrypted) {
                value = sessionStorage.getItem(this.ENCRYPTED_PREFIX + key);
                if (value) {
                    value = this.decrypt(value);
                }
            } else {
                value = sessionStorage.getItem(key);
            }

            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Error reading from sessionStorage:', error);
            return null;
        }
    }

    /**
     * Eliminar de sessionStorage
     */
    removeSession(key: string, encrypted: boolean = false): void {
        try {
            if (encrypted) {
                sessionStorage.removeItem(this.ENCRYPTED_PREFIX + key);
            } else {
                sessionStorage.removeItem(key);
            }
        } catch (error) {
            console.error('Error removing from sessionStorage:', error);
        }
    }

    /**
     * Limpiar sessionStorage
     */
    clearSession(): void {
        try {
            sessionStorage.clear();
        } catch (error) {
            console.error('Error clearing sessionStorage:', error);
        }
    }

    // ==================== ENCRIPTACIÓN ====================

    /**
     * Encriptar datos
     */
    private encrypt(data: string): string {
        return CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
    }

    /**
     * Desencriptar datos
     */
    private decrypt(data: string): string {
        const bytes = CryptoJS.AES.decrypt(data, this.SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    // ==================== UTILIDADES ====================

    /**
     * Obtener tamaño aproximado de localStorage (en bytes)
     */
    getStorageSize(): number {
        let size = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key);
                if (value) {
                    size += key.length + value.length;
                }
            }
        }
        return size;
    }

    /**
     * Obtener tamaño en formato legible
     */
    getStorageSizeFormatted(): string {
        const bytes = this.getStorageSize();
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}
