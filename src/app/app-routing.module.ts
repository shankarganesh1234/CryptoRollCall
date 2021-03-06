import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CryptoPricesComponent} from "./crypto-prices/crypto-prices.component";
import {CryptoFavoritesComponent} from "./crypto-favorites/crypto-favorites.component";
import {CryptoConverterComponent} from "./crypto-converter/crypto-converter.component";
import {CryptoAboutComponent} from "./crypto-about/crypto-about.component";
import {CryptoHowToComponent} from "./crypto-howto/crypto-howto.component";
import {CryptoDetailComponent} from "./crypto-detail/crypto-detail.component";
import {CryptoReferralComponent} from "./crypto-referral/crypto-referral.component";
import {CryptoApiComponent} from "./crypto-api/crypto-api.component";
import {CryptoWatchComponent} from "./crypto-watch/crypto-watch.component";
import {CryptoVisualComponent} from "./crypto-visual/crypto-visual.component";

const routes: Routes = [
    {path: '', component: CryptoPricesComponent},
    {path: 'favorites', component: CryptoFavoritesComponent},
    {path: 'convert', component: CryptoConverterComponent},
    {path: 'about', component: CryptoAboutComponent},
    {path: 'howto', component: CryptoHowToComponent},
    {path: 'detail', component: CryptoPricesComponent},
    {path: 'detail/:name/:symbol', component: CryptoDetailComponent},
    {path: 'referral', component: CryptoReferralComponent},
    {path: 'api', component: CryptoApiComponent},
    {path: 'watch', component: CryptoWatchComponent},
    {path: 'realtime', component: CryptoVisualComponent}
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
