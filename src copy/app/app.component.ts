import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {FormControl} from "@angular/forms";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'hw8';
    color = 'blue';

    constructor(private router: Router) {

    }


    getRouteLink() {
        let ticker = localStorage.getItem('ticker');
        if (ticker == "") {
            return ['/search/home'];
        } else {
            return ['/search', ticker];
        }
    }

    searchSelected() {
        const url = this.router.routerState.snapshot.url;
        const urls = url.split("/");
        return urls[1] === 'search' && urls[2] !== "home";
    }

    watchlistSelected(){
        const url = this.router.routerState.snapshot.url;
        const urls = url.split("/");
        return urls[1] === "watchlist";
    }

    portfolioSelected(){
        const url = this.router.routerState.snapshot.url;
        const urls = url.split("/");
        return urls[1] === "portfolio";
    }
}
