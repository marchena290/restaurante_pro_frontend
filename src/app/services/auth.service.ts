import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { tap } from "rxjs";

const TOKEN_KEY = 'restpro_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string}) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        const raw = res?.accessToken ?? res?.token?? null;
        const token = (typeof raw === 'string'? raw.trim() : raw || null);
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }
      })
    )
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

}
