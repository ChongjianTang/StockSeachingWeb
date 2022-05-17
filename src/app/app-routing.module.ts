import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {WatchlistComponent} from "./watchlist/watchlist.component";
import {PortfolioComponent} from "./portfolio/portfolio.component";
import {SearchResultComponent} from "./home/search-result/search-result.component";

const routes: Routes = [
    {path: '', redirectTo: 'search/home', pathMatch: 'full'},
    {path: 'search', redirectTo: 'search/home', pathMatch: 'full'},
    {path: 'search/home', component: HomeComponent},
    {
        path: 'search', component: HomeComponent,
        children: [
            {
                path: ':ticker',
                component: SearchResultComponent,
                data: {keep: true}
            },
        ]
    },
    {path: 'watchlist', component: WatchlistComponent},
    {path: 'portfolio', component: PortfolioComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {

}
