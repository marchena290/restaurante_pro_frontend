import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { tap, BehaviorSubject, of, throwError } from "rxjs";
import { delay } from 'rxjs/operators';

const TOKEN_KEY = 'restpro_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());
  public authState$ = this.authState.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: { email?: string; username?: string; password: string}) {
    // In dev, provide a simple mocked login so the UI can be tested without backend
    if (environment.useMocks) {
      const id = credentials.email ?? credentials.username ?? 'demo@local';
      const pw = credentials.password ?? '';

      // simple demo credentials handling
      const isAdmin = (id === 'admin@restaurant.com' && pw === 'admin123');
      const isEmpleado = (id === 'empleado@restaurant.com' && pw === 'empleado123');

      if (!isAdmin && !isEmpleado) {
        return throwError(() => new Error('Credenciales de prueba inválidas')).pipe(delay(300));
      }

      const role = isAdmin ? 'ADMIN' : 'EMPLEADO';
      const payload = {
        sub: id,
        name: isAdmin ? 'Administrador Demo' : 'Empleado Demo',
        email: id,
        roles: [role]
      };

      const header = { alg: 'HS256', typ: 'JWT' };

      const base64Url = (obj: any) => {
        const json = JSON.stringify(obj);
        const b64 = btoa(json)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        return b64;
      };

      const fakeToken = `${base64Url(header)}.${base64Url(payload)}.signature`;

      // mimic backend response shape
      const response = { accessToken: fakeToken };

      return of(response).pipe(
        delay(300),
        tap((res: any) => {
          const raw = res?.accessToken ?? res?.token ?? null;
          const token = (typeof raw === 'string' ? raw.trim() : raw || null);
          if (token) {
            localStorage.setItem(TOKEN_KEY, token);
            this.authState.next(true);
          }
        })
      );
    }

    // Map form credentials to backend contract: backend expects { username, password }
    const body = { username: credentials.username ?? credentials.email, password: credentials.password };

    return this.http.post<any>(`${environment.apiUrl}/auth/login`, body).pipe(
      tap((res: any) => {
        const raw = res?.accessToken ?? res?.token ?? null;
        const token = (typeof raw === 'string' ? raw.trim() : raw || null);
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
          // Emitimos el nuevo estado de autenticación
          this.authState.next(true);
        }
      })
    )
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.authState.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return atob(str);
  }

  decodeToken(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const json = this.base64UrlDecode(payload);
      return JSON.parse(json);
    } catch (e) {
      console.warn('AuthService.decodeToken: token parse error', e);
      return null;
    }
  }

  getUserRoles(): string[] {
    const payload = this.decodeToken();
    if (!payload) return [];
    const claim = payload.roles ?? payload.authorities ?? payload.role ?? null;
    if (!claim) return [];
    const normalize = (r: string) => String(r).trim().replace(/^ROLE_/i, '');
    if (Array.isArray(claim)) return claim.map((r: any) => normalize(String(r)));
    if (typeof claim === 'string') return claim.split(',').map(s => normalize(s)).filter(Boolean);
    return [];
  }

  hasRole(expected: string): boolean {
    const roles = this.getUserRoles();
    return roles.some(r => r.toLowerCase() === expected.toLowerCase());
  }

  /**
   * Intenta extraer información básica del usuario desde el token JWT.
   * Devuelve null si no hay token o no contiene información útil.
   */
  getCurrentUser(): { id?: string; name?: string; email?: string; role?: string } | null {
    const payload = this.decodeToken();
    if (!payload) return null;

    const name = payload.name || payload.fullName || payload.sub || payload.username || null;
    const email = payload.email || null;
    // try common role/roles claim
    const roleClaim = payload.role ?? payload.roles ?? payload.authorities ?? null;
    let role: string | undefined = undefined;
    const normalize = (r: string) => r.replace(/^ROLE_/i, '').trim();
    if (Array.isArray(roleClaim) && roleClaim.length) role = normalize(String(roleClaim[0]));
    else if (typeof roleClaim === 'string') role = normalize(roleClaim.split(',')[0]);

    return { id: payload.sub || undefined, name: name ?? undefined, email: email ?? undefined, role };
  }
}
