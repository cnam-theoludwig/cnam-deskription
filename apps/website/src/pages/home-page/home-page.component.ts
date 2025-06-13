import { Component } from "@angular/core"
import { RouterModule } from "@angular/router"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: "./home-page.component.html",
  styleUrl: "./home-page.component.css",
})
export class HomePageComponent {}
