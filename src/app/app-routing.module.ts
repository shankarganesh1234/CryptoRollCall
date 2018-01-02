import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CryptoPricesComponent} from "./crypto-prices/crypto-prices.component";
import {CryptoFavoritesComponent} from "./crypto-favorites/crypto-favorites.component";
import {CryptoConverterComponent} from "./crypto-converter/crypto-converter.component";

const routes: Routes = [
    {path: '', component: CryptoPricesComponent},
    {path: 'favorites', component: CryptoFavoritesComponent},
    {path: 'convert', component: CryptoConverterComponent},

];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
