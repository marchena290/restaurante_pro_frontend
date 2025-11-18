# Restaurante Pro — Frontend

Elegant, focused frontend for the Restaurante Pro system.

This repository contains the Angular-based frontend application that consumes the existing Spring Boot REST API (the backend lives in a different repository). The goal of this frontend is to provide a light, maintainable, and testable UI for restaurant staff and clients: login, manage mesas, menús, reservaciones and view reports.

---

**Quick summary**

- **Stack:** Angular, TypeScript, SCSS
- **API:** The app talks to the backend base URL configured in `src/environments/environment.ts` (default: `http://localhost:8080/api`).
- **Auth:** JWT-based login. The frontend stores the token in `localStorage` under the key `restpro_token` and attaches it to requests via an HTTP interceptor.

---

**Setup & Run (Development)**

Prerequisites:

- Node.js (recommended 16+ or as required by your Angular version)
- npm (or Yarn)

Install and run the dev server:

```powershell
cd "c:\Users\alons\OneDrive\Escritorio\restaurante-front-end"
npm install
npm run start
```

Open the app at `http://localhost:4200/` (default from Angular CLI).

If your backend runs on a different host/port, update `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

**Authentication details (important for devs)**

- Login request: `POST /api/auth/login` with credentials.
- The backend returns a token (field name may be `accessToken` or `token`). The frontend normalises that and stores the token in `localStorage` under `restpro_token`.
- An HTTP interceptor reads the token and adds an `Authorization: Bearer <token>` header to outgoing requests (except login).
- If you see empty `localStorage`, inspect the login response in the browser DevTools Network tab to confirm the token field name and shape.

---

**Developer workflow & tips**

- Use the built-in Angular dev server for quick development: `npm run start`.
- To run unit tests (if present): `npm test`.
- To build for production: `npm run build -- --configuration production` (or `ng build --configuration production`).
- If you face CORS issues when calling the backend, enable CORS on the Spring Boot server or use a development proxy.
- Keep API DTOs and models synchronized with the backend. This project stores TypeScript interfaces in `src/app/models/` (if present).

---

**Project Structure (high-level)**

- `src/app/` — application code (components, services, guards, interceptors)
- `src/environments/` — environment configs (update `apiUrl` as needed)
- `src/styles.scss` — global styles

---

**Common troubleshooting**

- Token not being stored: Check login response shape and console logs added in `AuthService`.
- 401 responses: verify token was attached by the interceptor and not expired.
- API not reachable: check `environment.apiUrl` and backend running status.

---

**Contributing & Notes**

- This repo focuses on the frontend only. Backend issues should be opened in the backend repository.
- Prefer small, focused pull requests and include screenshots for UI changes where useful.
- Add unit tests for services and guards; prefer integration tests for important flows.

---

If you want, I can also:

- Add a short development checklist and a contributor template.
- Produce an English version of this README.
- Commit and push the file to the remote for you (I can provide the commands).

---

Generated on: 2025-11-17
# RestauranteFrontEnd

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
