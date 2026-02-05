import { Injectable, signal } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class RoleService {
  private readonly _currentRole = signal<string>(this.getStoredRole())

  private getStoredRole(): string {
    const stored = localStorage.getItem("selectedRole")
    return stored ?? "Utilisateur"
  }

  private storeRole(role: string) {
    localStorage.setItem("selectedRole", role)
  }

  public get currentRole() {
    return this._currentRole()
  }

  public setRole(role: string) {
    this._currentRole.set(role)
    this.storeRole(role)
  }
}
