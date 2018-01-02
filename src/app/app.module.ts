import {BrowserModule} from "@angular/platform-browser";
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule, JsonpModule} from "@angular/http";
import {CryptoPricesComponent} from "./crypto-prices/crypto-prices.component";
import {CryptoService} from "./services/crypto.service";
import {AppComponent} from "./app.component";
import {AppRoutingModule} from "./app-routing.module";
import {CryptoFavoritesComponent} from "./crypto-favorites/crypto-favorites.component";
import {CryptoFooterComponent} from "./crypto-footer/crypto-footer.component";
import {CryptoConverterComponent} from "./crypto-converter/crypto-converter.component";

@NgModule({
  declarations: [
    AppComponent,
    CryptoPricesComponent,
    CryptoFavoritesComponent,
    CryptoFooterComponent,
    CryptoConverterComponent
  ],
  imports: [BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpModule,
    JsonpModule,
    ReactiveFormsModule,
  ],
  providers: [CryptoService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // add this!
})
export class AppModule { }
