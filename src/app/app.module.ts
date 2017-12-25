import {BrowserModule} from "@angular/platform-browser";
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule, JsonpModule} from "@angular/http";
import {CryptoPricesComponent} from "./crypto-prices/crypto-prices.component";
import {CryptoService} from "./services/crypto.service";
import {AppComponent} from "./app.component";
import {AppRoutingModule} from "./app-routing.module";

@NgModule({
  declarations: [
    AppComponent,
    CryptoPricesComponent
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
