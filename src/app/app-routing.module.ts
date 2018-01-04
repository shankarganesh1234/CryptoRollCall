import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CryptoPricesComponent} from "./crypto-prices/crypto-prices.component";
import {CryptoFavoritesComponent} from "./crypto-favorites/crypto-favorites.component";
import {CryptoConverterComponent} from "./crypto-converter/crypto-converter.component";
import {CryptoAboutComponent} from "./crypto-about/crypto-about.component";

const routes: Routes = [
    {path: '', component: CryptoPricesComponent},
    {path: 'favorites', component: CryptoFavoritesComponent},
    {path: 'convert', component: CryptoConverterComponent},
    {path: 'about', component: CryptoAboutComponent},
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
