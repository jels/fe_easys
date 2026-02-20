import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../conf/auth.service';
import { LoginDto } from '../../models/dto/LoginDto';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private api = environment.apiUrl;
    private tokenLocal = '';
    private user = '';

    private headers!: HttpHeaders;
    private loginUser!: LoginDto;

    usr!: LoginDto;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        const usrLocal = localStorage.getItem('usr');
        this.usr = usrLocal ? JSON.parse(usrLocal) : null;
        if (this.usr === null || undefined) {
            this.tokenLocal = environment.presetToken;
        } else {
            this.tokenLocal = this.usr.token;
            this.user = this.usr.username;
        }
    }

    createHeader(token: string) {
        this.headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    createLoginDto(idUser: number, name: string | null, pass: string, rol: number | null, username: string, token: string) {
        this.loginUser = {
            idUser: idUser,
            name: name,
            password: pass,
            rol: rol,
            token: token,
            username: username
        };
    }

    login(user: string, pass: string): Observable<any> {
        const presetToken = environment.presetToken;
        const headers = new HttpHeaders().set('Authorization', `Bearer ${presetToken}`);

        // Creamos el DTO de login
        const loginUser = {
            name: null,
            password: pass,
            rol: null,
            token: presetToken,
            username: user
        };

        return this.http.post<any>(this.api + '/user/login', loginUser, { headers }).pipe(
            tap((response) => {
                // Guardamos los datos del usuario con el nuevo token
                this.authService.updateUserAfterLogin(response.objeto); // ⚠️ Asegúrate de que este método exista
            })
        );
    }

    logout(): Observable<any> {
        return this.http.get<any>(this.api + 'user/login/logout/' + this.authService.username);
    }

    get token(): string {
        const usr = localStorage.getItem('usr');
        return usr ? JSON.parse(usr).token : environment.presetToken;
    }

    // newUserExist(user: string, email: string): Observable<any> {
    //   this.createHeader(environment.presetToken);
    //   return this.http.get<any>(
    //     this.api + '/usr/exist_user/' + user + '&' + email,
    //     {
    //       headers: this.headers,
    //     },
    //   );
    // }

    // lastConection(idUser: Number): Observable<any> {
    //   return this.http.put<any>(
    //     this.api + '/usr/user/login/conexion/' + idUser,
    //     null,
    //   );
    // }
}
