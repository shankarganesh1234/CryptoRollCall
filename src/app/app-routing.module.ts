import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CryptoPricesComponent} from "./crypto-prices/crypto-prices.component";

const routes: Routes = [
    {path: 'home', component: CryptoPricesComponent}
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
