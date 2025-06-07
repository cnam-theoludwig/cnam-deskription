import type { Routes } from "@angular/router"
//import { HomePageComponent } from "../pages/home-page/home-page.component"
import { FurnituresPageComponent } from "../pages/furnitures-page/furnitures-page.component"

export const routes: Routes = [
  // {
  //   path: "",
  //   component: HomePageComponent,
  // },
  {
    path: "",
    component: FurnituresPageComponent,
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
