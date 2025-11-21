import type { ApplicationConfig } from "@angular/core"
import { provideZoneChangeDetection } from "@angular/core"
import { provideRouter } from "@angular/router"

import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import { routes } from "./app.routes"

import { providePrimeNG } from "primeng/config"
import Aura from "@primeuix/themes/aura"

import { registerLocaleData } from "@angular/common"
import localeFr from "@angular/common/locales/fr"
registerLocaleData(localeFr, "fr")

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: ".my-app-dark",
        },
      },
    }),
  ],
}
