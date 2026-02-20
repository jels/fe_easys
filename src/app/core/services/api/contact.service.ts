import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Contact } from '../../model/dto/Contact';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = environment.apiUrl; //se debe agregar el api-consultar con Elias

  constructor(private http: HttpClient) {}

  sendMessage(data: Contact): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/sendEmailContact', data);
  }

  // sendContactForm(form: Contact, captchaToken: string): Observable<any> {
  //   return this.http.post(this.apiUrl, {
  //     ...form,
  //     captchaToken,
  //   });
  // }
}
