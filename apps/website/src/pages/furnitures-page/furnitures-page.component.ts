import { CommonModule } from "@angular/common"
import { Component, inject } from "@angular/core"
import type { FurnitureWithRelations } from "@repo/models/Furniture"
import { ButtonModule } from "primeng/button"
import { FurnitureAddFormComponent } from "../../components/furnitures/furniture-add-form/furniture-add-form.component"
import { HeaderComponent } from "../../components/header/header.component"
import { SearchEngineComponent } from "../../components/search-engine/search-engine.component"
import { BuildingService } from "../../services/building.service"
import { FurnitureService } from "../../services/furniture.service"
import { LocationService } from "../../services/location.service"
import { RoleService } from "../../services/role.service"
import { RoomService } from "../../services/room.service"
import { StateService } from "../../services/state.service"
import { StoreyService } from "../../services/storey.service"
import { TypeService } from "../../services/type.service"

@Component({
  selector: "app-furnitures-page",
  imports: [
    CommonModule,
    HeaderComponent,
    FurnitureAddFormComponent,
    SearchEngineComponent,
    ButtonModule,
  ],
  templateUrl: "./furnitures-page.component.html",
  styleUrl: "./furnitures-page.component.css",
})
export class FurnituresPageComponent {
  protected readonly furnitureService = inject(FurnitureService)
  protected readonly locationService = inject(LocationService)
  protected readonly buildingService = inject(BuildingService)
  protected readonly storeyService = inject(StoreyService)
  protected readonly roomService = inject(RoomService)
  protected readonly stateService = inject(StateService)
  protected readonly typeService = inject(TypeService)
  protected readonly roleService = inject(RoleService)

  public constructor() {
    this.furnitureService.get()
  }

  public openModal(furnitureId?: FurnitureWithRelations["id"]) {
    this.furnitureService.openModal(furnitureId)
  }

  public closeModal() {
    this.furnitureService.closeModal()
  }

  public exportToExcel() {
    this.furnitureService.exportToExcel()
  }

  public fakeViewState() {
    alert("Visualisation d'état fonctionnel à implémenter plus tard.")
  }

  public fakeNotify() {
    alert("Notification de déplacement à implémenter plus tard.")
  }

  public getSeverityClasses(state: string): string {
    const base =
      "px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
    switch (state?.toLowerCase()) {
      case "neuf":
      case "très bon état":
        return `${base} bg-green-100 text-green-700`
      case "bon état":
        return `${base} bg-blue-100 text-blue-700`
      case "usagé":
        return `${base} bg-yellow-100 text-yellow-700`
      case "abîmé":
      case "hors service":
        return `${base} bg-red-100 text-red-700`
      default:
        return `${base} bg-gray-100 text-gray-700`
    }
  }
}
