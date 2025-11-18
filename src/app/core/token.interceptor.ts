import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Observable } from "rxjs";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
   constructor(private auth: AuthService) {}

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
    return next.handle(cloned);
  }
}
