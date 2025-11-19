import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('restaurante-front-end');
  protected readonly collapsed = signal(false);
  protected readonly showShell = signal(true);
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    // Update `title` signal from the active route's data.title when navigation ends
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
      let route = this.activatedRoute.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      const data = route.snapshot.data || {};
      const pageTitle = data['title'] || 'Dashboard';
      this.title.set(pageTitle);

      // Hide shell (header/sidebar) on the login page only
      const url = this.router.url.split('?')[0] || '';
      this.showShell.set(url !== '/login');
    });
  }

  toggleSidebar() {
    this.collapsed.set(!this.collapsed());
  }
}
