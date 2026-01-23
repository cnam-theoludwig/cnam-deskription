import { Component, inject } from "@angular/core"
import type { OnInit } from "@angular/core"
import { Router, RouterLink } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { SelectModule } from "primeng/select"
import { ButtonModule } from "primeng/button"
import { RoleService } from "../../services/role.service"

@Component({
  selector: "app-header",
  imports: [FormsModule, SelectModule, ButtonModule, RouterLink],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css",
})
export class HeaderComponent implements OnInit {
  public readonly roleService = inject(RoleService)
  private readonly router = inject(Router)

  public roles: any[] | undefined

  public ngOnInit() {
    this.roles = [
      { name: "Responsable de site" },
      { name: "Gestionnaire de mobilier" },
      { name: "Utilisateur" },
      { name: "Loueur de mobilier" },
    ]
  }

  public get selectedRole() {
    // Always return the current role from service
    return this.roles?.find((role) => {
      return role.name === this.roleService.currentRole
    })
  }

  public onRoleChange(role: any) {
    this.roleService.setRole(role.name)
  }

  public navigateToViewer() {
    void this.router.navigate(["/viewer"])
  }

  public goBack() {
    void this.router.navigate(["/"])
  }

  public get isOnViewerPage(): boolean {
    return this.router.url === "/viewer"
  }
}
