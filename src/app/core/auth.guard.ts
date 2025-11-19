import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor( private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise< boolean | UrlTree> {
      if(this.auth.isLoggedIn()) {

      // Si la ruta no declara roles, permitir.
      const requiredRoles: string[] = (route.data && route.data['roles']) ? route.data['roles'] as string[] : [];

      // Si hay token y el servicio considera al usuario logueado, permitimos.
      if (requiredRoles.length === 0) {
        return true;
      }

      // Si está autenticado pero no tiene los roles, redirigir a "forbidden" o a dashboard.
      const hasAny = requiredRoles.some(r => this.auth.hasRole(r));
      if (hasAny) return true;

      return this.router.createUrlTree(['/forbidden']);
    }

    // No autenticado: redirigir a login con returnUrl
    return this.router.createUrlTree(['/login'], { queryParams: {returnUrl: state.url } });
  }
}

