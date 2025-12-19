import type { Routes } from "@angular/router"
import { FurnituresPageComponent } from "../pages/furnitures-page/furnitures-page.component"
import { BuildingPageComponent } from "../pages/building-page/building-page.component"

export const routes: Routes = [
  {
    path: "",
    component: FurnituresPageComponent,
  },
  {
    path: "viewer",
    component: BuildingPageComponent,
  },
  {
    path: "**",
    loadComponent: async () => {
      const { NotFoundPageComponent } = await import(
        "../pages/not-found-page/not-found-page.component"
      )
      return NotFoundPageComponent
    },
  },
]
