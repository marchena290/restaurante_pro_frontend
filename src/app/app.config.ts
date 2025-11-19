import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TokenInterceptor } from './core/token.interceptor';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

// Real services
import { MesasService } from './services/mesas.service';
import { ClientesService } from './services/clientes.service';
import { MenusService } from './services/menus.service';

// Mock implementations
import { MesasMockService } from './services/mesas.mock.service';
import { ClientesMockService } from './services/clientes.mock.service';
import { MenusMockService } from './services/menus.mock.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    // Conditional mock providers: when `environment.useMocks` is true we replace
    // the network-backed services with in-memory mock implementations. This
    // keeps the rest of the app code unchanged while allowing offline demos
    // and faster development iterations.
    ...(environment.useMocks ? [
      { provide: MesasService, useClass: MesasMockService },
      { provide: ClientesService, useClass: ClientesMockService },
      { provide: MenusService, useClass: MenusMockService }
    ] : [])
  ]
};
