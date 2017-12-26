import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CryptoPricesComponent} from "./crypto-prices/crypto-prices.component";
import {CryptoFavoritesComponent} from "./crypto-favorites/crypto-favorites.component";
import {CryptoContactComponent} from "./crypto-contact/crypto-contact.component";
import {CryptoDonateComponent} from "./crypto-donate/crypto-donate.component";

const routes: Routes = [
    {path: '', component: CryptoPricesComponent},
    {path: 'favorites', component: CryptoFavoritesComponent},
    {path: 'contact', component: CryptoContactComponent},
    {path: 'donate', component: CryptoDonateComponent}
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
