import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Observable, throwError } from "rxjs";
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
   constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/auth/')){
      return next.handle(req);
    }

    const token = this.auth.getToken();
    if (!token) {
      return next.handle(req);
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token
      }
    })

    return next.handle(cloned).pipe(
      catchError((err: any) => {
        // Si recibimos 401, hacemos logout y redirigimos al login.
        if (err && err.status === 401) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  }
}
