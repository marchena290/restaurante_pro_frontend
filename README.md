# 🚀 Restaurante Pro — Frontend

¡Bienvenido al frontend de Restaurante Pro! Este repositorio contiene la aplicación Angular que consume la API REST del backend (Spring Boot). Está pensada para ser ligera, mantenible y fácil de probar: login, gestión de mesas, menús, reservaciones y reportes.

---

✨ **Resumen rápido**

- **Stack:** Angular + TypeScript + SCSS
- **API base:** `src/environments/environment.ts` (por defecto `http://localhost:8080/api`)
- **Autenticación:** JWT. Token guardado en `localStorage` con la clave `restpro_token` y añadido a las peticiones por un interceptor HTTP.

---

🛠️ **Instalación y ejecución (desarrollo)**

Requisitos:

- Node.js (recomendado 16+ según la versión de Angular)
- npm (o Yarn)

Comandos (PowerShell):

```powershell
cd "c:\Users\alons\OneDrive\Escritorio\restaurante-front-end"
npm install
npm run start
```

La app se abrirá en `http://localhost:4200/`.

Si el backend está en otra URL, actualiza `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

🔐 **Autenticación (importante para desarrolladores)**

- Endpoint de login: `POST /api/auth/login` con credenciales.
- El backend devuelve un token (puede venir como `accessToken` o `token`). El frontend normaliza el campo y lo guarda en `localStorage` bajo `restpro_token`.
- Un `TokenInterceptor` añade `Authorization: Bearer <token>` a las peticiones (excepto la de login).
- Si no ves el token en `localStorage`, abre DevTools → Network → selecciona la petición de login y revisa la respuesta para comprobar el nombre del campo.

⚠️ Consejo: Para depurar rápido, añade `console.log` en `AuthService` donde se guarda el token y revisa la consola del navegador.

---

🧭 **Flujos y features principales**

- Login / Logout
- Gestión de usuarios y permisos (si procede)
- CRUD de mesas y menús
- Reserva de mesas y administración de estados de reserva
- Dashboard de reportes (ventas, reservas, ocupación)

---

🧰 **Buenas prácticas y tips de desarrollo**

- Usa `npm run start` para desarrollo rápido.
- Pruebas: `npm test` (si están configuradas).
- Build producción: `npm run build -- --configuration production`.
- Si hay problemas de CORS, habilítalo en el backend o usa un proxy de desarrollo.
- Mantén actualizados los DTOs/Interfaces de `src/app/models/` con el backend.

---

🛠️ **Estructura principal del proyecto**

- `src/app/` — código de la app (componentes, servicios, guards, interceptors)
- `src/environments/` — variables de entorno (modifica `apiUrl` si es necesario)
- `src/styles.scss` — estilos globales

---

🐞 **Solución rápida a problemas comunes**

- Token no guardado: revisa la respuesta del login y las llamadas en `AuthService`.
- 401/403: verifica que el token se adjunta y no esté expirado.
- API no accesible: comprueba `environment.apiUrl` y que el backend esté corriendo.

---

🤝 **Contribuir**

- Este repositorio es sólo frontend; los issues del backend deben abrirse en el repositorio del backend.
- Prefiere PRs pequeños y descriptivos. Añade capturas de pantalla para cambios UI.
- Añade tests para servicios y guards; las integraciones críticas deberían cubrirse con tests.

---

📌 ¿Quieres que haga esto por ti?

- Puedo añadir una versión en inglés.
- Puedo crear un `CONTRIBUTING.md` y plantillas de PR/Issue.
- Puedo commitear y empujar estos cambios (ya lo haré ahora).

---

Generado: 2025-11-17


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.10.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
