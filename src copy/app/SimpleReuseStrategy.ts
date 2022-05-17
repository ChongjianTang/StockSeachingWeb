import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle, UrlSegment } from '@angular/router';


// THIS IS FROM https://blog.csdn.net/qq_39962271/article/details/122955773
export class SimpleReuseStrategy implements RouteReuseStrategy {
    static cacheRouters = new Map<string, DetachedRouteHandle>();

    public static deleteRouteCache(url:any): void {
        if (SimpleReuseStrategy.cacheRouters.has(url)) {
            const handle: any = SimpleReuseStrategy.cacheRouters.get(url);
            try {
                handle.componentRef.destory();
            } catch (e) { }
            SimpleReuseStrategy.cacheRouters.delete(url);
        }
    }

    public static deleteAllRouteCache(): void {
        SimpleReuseStrategy.cacheRouters.forEach((handle: any, key) => {
            SimpleReuseStrategy.deleteRouteCache(key);
        });
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig &&
            JSON.stringify(future.params) === JSON.stringify(curr.params);
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        const url = this.getFullRouteURL(route);
        if (route.data['keep'] && SimpleReuseStrategy.cacheRouters.has( url) ) {
            return SimpleReuseStrategy.cacheRouters.get(url)||'';
        } else {
            return null||'';
        }
    }

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return Boolean(route.data['keep']);
    }
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        const url = this.getFullRouteURL(route);
        SimpleReuseStrategy.cacheRouters.set(url, handle);
    }
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const url = this.getFullRouteURL(route);
        return Boolean(route.data['keep']) && SimpleReuseStrategy.cacheRouters.has(url);
    }

    private getFullRouteURL(route: ActivatedRouteSnapshot): string {
        const { pathFromRoot } = route;
        let fullRouteUrlPath: string[] = [];
        pathFromRoot.forEach((item: ActivatedRouteSnapshot) => {
            fullRouteUrlPath = fullRouteUrlPath.concat( this.getRouteUrlPath(item) );
        });
        return `/${fullRouteUrlPath.join('/')}`;

    }
    private getRouteUrlPath(route: ActivatedRouteSnapshot) {
        return route.url.map(urlSegment => urlSegment.path);
    }
}

