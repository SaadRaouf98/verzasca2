import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NavigationEnd, NavigationStart, Router, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string; // translation key
  route?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private breadcrumbSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumb$: Observable<BreadcrumbItem[]> = this.breadcrumbSubject.asObservable();

  private currentBreadcrumbSubject = new BehaviorSubject<BreadcrumbItem | null>(null);
  public currentBreadcrumb$ = this.currentBreadcrumbSubject.asObservable();

  private previousBreadcrumb: BreadcrumbItem | null = null;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    // Get the initial URL to determine the starting breadcrumb
    const initialBreadcrumb = this.getCurrentBreadcrumb(this.activatedRoute.root);

    if (initialBreadcrumb) {
      this.previousBreadcrumb = initialBreadcrumb;
    }

    this.initializeBreadcrumbs();
  }

  private initializeBreadcrumbs(): void {
    // On NavigationEnd, emit the breadcrumbs
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const currentBreadcrumb = this.getCurrentBreadcrumb(this.activatedRoute.root);

        // Skip if this is the same route (page reload)
        if (this.previousBreadcrumb && this.previousBreadcrumb.label === currentBreadcrumb?.label) {
          return;
        }

        const breadcrumbs: BreadcrumbItem[] = [];

        // Emit previous breadcrumb if different from current
        if (this.previousBreadcrumb && currentBreadcrumb) {
          breadcrumbs.push(this.previousBreadcrumb);
        }

        // Emit the breadcrumb array for display
        this.breadcrumbSubject.next(breadcrumbs);
        this.currentBreadcrumbSubject.next(currentBreadcrumb);

        // Update previous for next navigation
        if (currentBreadcrumb) {
          this.previousBreadcrumb = currentBreadcrumb;
        }
      });
  }
  private getCurrentBreadcrumb(route: ActivatedRoute): BreadcrumbItem | null {
    const ROUTE_DATA_BREADCRUMB = 'breadcrumb';
    let currentRoute = route;
    let lastBreadcrumb: BreadcrumbItem | null = null;

    // Walk through all routes and get the FIRST one with a breadcrumb
    const visited = new Set<ActivatedRoute>();

    while (currentRoute && !visited.has(currentRoute)) {
      visited.add(currentRoute);

      const routeURL: string = currentRoute.snapshot.url.map((segment) => segment.path).join('/');
      const label = currentRoute.snapshot.data[ROUTE_DATA_BREADCRUMB];

      if (routeURL !== '' && label) {
        lastBreadcrumb = { label, route: routeURL };
        return lastBreadcrumb;
      }

      // Move to the first primary child
      const primaryChild = currentRoute.children.find((child) => child.outlet === 'primary');
      if (!primaryChild) {
        break;
      }
      currentRoute = primaryChild;
    }

    return lastBreadcrumb;
  }

  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.breadcrumbSubject.next(breadcrumbs);
  }
}
