import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

// When running with mocks in development, auto-inject a demo JWT into
// localStorage so the AuthGuard sees the app as authenticated. This keeps
// developer flow fast (no manual login) while real auth still applies in prod.
try {
  // Disabled: automatic demo token injection. Keep developer flows explicit
  // so we don't accidentally authenticate against a real backend.
  // If you need the demo token for offline development re-enable manually.
} catch (e) {
  // ignore — some test environments won't have localStorage
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
