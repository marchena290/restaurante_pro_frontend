import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private containers: Record<string, HTMLElement> = {};

  private ensureContainer(position: 'top-right' | 'bottom-right' = 'top-right') {
    if (this.containers[position]) return this.containers[position];
    const c = document.createElement('div');
    c.setAttribute('aria-live', 'polite');
    c.style.position = 'fixed';
    c.style.zIndex = '99999';
    c.style.display = 'flex';
    c.style.flexDirection = 'column';
    c.style.gap = '8px';
    c.style.pointerEvents = 'none';
    if (position === 'top-right') {
      c.style.top = '16px';
      c.style.right = '16px';
      c.style.alignItems = 'flex-end';
    } else {
      c.style.bottom = '16px';
      c.style.right = '16px';
      c.style.alignItems = 'flex-end';
    }
    document.body.appendChild(c);
    this.containers[position] = c;
    return c;
  }

  show(message: string, type: 'info' | 'success' | 'error' = 'info', timeout = 4000, position: 'top-right' | 'bottom-right' = 'top-right') {
    const container = this.ensureContainer(position);
    const el = document.createElement('div');
    el.textContent = message;
    el.style.padding = '10px 14px';
    el.style.borderRadius = '8px';
    el.style.color = '#fff';
    el.style.minWidth = '200px';
    el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    el.style.fontSize = '0.95rem';
    el.style.opacity = '0';
    el.style.transition = 'opacity .15s ease, transform .15s ease';
    el.style.transform = position === 'top-right' ? 'translateY(-6px)' : 'translateY(6px)';
    el.style.pointerEvents = 'auto';

    if (type === 'error') el.style.background = '#ef4444';
    else if (type === 'success') el.style.background = '#16a34a';
    else el.style.background = '#0ea5e9';

    container.appendChild(el);
    // force reflow
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.getBoundingClientRect();
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';

    const remove = () => {
      try {
        el.style.opacity = '0';
        el.style.transform = position === 'top-right' ? 'translateY(-6px)' : 'translateY(6px)';
        setTimeout(() => { try { container.removeChild(el); } catch {} }, 160);
      } catch {}
    };

    const t = setTimeout(remove, timeout);
    el.addEventListener('click', () => { clearTimeout(t); remove(); });
  }
}
