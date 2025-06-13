import { Component } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { NgxSonnerToaster } from "ngx-sonner"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {}
