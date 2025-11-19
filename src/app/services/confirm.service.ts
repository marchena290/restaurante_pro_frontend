import { ApplicationRef, Injectable, Injector, EnvironmentInjector } from '@angular/core';
import { createComponent } from '@angular/core';
import { ConfirmModalComponent } from '../components/shared/confirm-modal.component';
import { NotificationService } from './notification.service';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(private appRef: ApplicationRef, private injector: Injector, private notification: NotificationService) {}

  confirm(opts: ConfirmOptions = {}): Promise<boolean> {
    return new Promise(resolve => {
      try {
        const envInjector = this.injector.get(EnvironmentInjector, null);

        const createAndAttach = (environmentInjector: EnvironmentInjector | any) => {
          const compRef = createComponent(ConfirmModalComponent, { environmentInjector });

          compRef.instance.title = opts.title ?? 'Confirmar';
          compRef.instance.message = opts.message ?? '¿Estás seguro?';
          compRef.instance.confirmLabel = opts.confirmLabel ?? 'Confirmar';
          compRef.instance.cancelLabel = opts.cancelLabel ?? 'Cancelar';

          const subConfirm = compRef.instance.confirm.subscribe(() => { cleanup(); resolve(true); });
          const subCancel = compRef.instance.cancel.subscribe(() => { cleanup(); resolve(false); });

          this.appRef.attachView(compRef.hostView);
          const domEl = (compRef.hostView as any).rootNodes[0] as HTMLElement;
          document.body.appendChild(domEl);

          function cleanup() {
            try { subConfirm.unsubscribe(); } catch {}
            try { subCancel.unsubscribe(); } catch {}
            try { compRef.destroy(); } catch {}
          }
        };

        if (envInjector) {
          createAndAttach(envInjector);
          return;
        }

        const fallbackInjector = this.appRef.components && this.appRef.components.length
          ? this.appRef.components[0].injector
          : null;

        if (!fallbackInjector) throw new Error('No suitable injector found for ConfirmModalComponent');

        createAndAttach(fallbackInjector as any);
      } catch (err) {
        this.notification.show('Error creando modal de confirmación', 'error');
        resolve(false);
      }
    });
  }
}
