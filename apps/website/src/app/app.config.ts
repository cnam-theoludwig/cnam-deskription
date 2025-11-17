import type { ApplicationConfig } from "@angular/core"
import { provideZoneChangeDetection } from "@angular/core"
import { provideRouter } from "@angular/router"
import { provideAnimations } from "@angular/platform-browser/animations"

import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import { routes } from "./app.routes"

import { providePrimeNG } from "primeng/config"
import Aura from "@primeuix/themes/aura"

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),

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
