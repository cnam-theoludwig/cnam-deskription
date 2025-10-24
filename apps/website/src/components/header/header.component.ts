import { Component } from "@angular/core"
import type { OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { SelectModule } from "primeng/select"

@Component({
  selector: "app-header",
  imports: [FormsModule, SelectModule],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css",
})
export class HeaderComponent implements OnInit {
  public roles: any[] | undefined

  public selectedRole: any

  public ngOnInit() {
    this.roles = [
      { name: "Responsable de site" },
      { name: "Gestionnaire de mobilier" },
      { name: "Utilisateur" },
      { name: "Loueur de mobilier" },
    ]
  }
}
