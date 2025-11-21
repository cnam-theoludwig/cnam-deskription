import { CommonModule } from "@angular/common"
import { Component, inject } from "@angular/core"
import type { Furniture, FurnitureWithRelations } from "@repo/models/Furniture"
import { FurnitureAddFormComponent } from "../../components/furnitures/furniture-add-form/furniture-add-form.component"
import { HeaderComponent } from "../../components/header/header.component"
import { SearchEngineComponent } from "../../components/search-engine/search-engine.component"
import { BuildingService } from "../../services/building.service"
import { FurnitureService } from "../../services/furniture.service"
import { LocationService } from "../../services/location.service"
import { RoomService } from "../../services/room.service"
import { StateService } from "../../services/state.service"
import { StoreyService } from "../../services/storey.service"
import { TypeService } from "../../services/type.service"
import { BuildingPageComponent } from "../building-page/building-page.component"

@Component({
  selector: "app-furnitures-page",
  imports: [
    CommonModule,
    HeaderComponent,
    FurnitureAddFormComponent,
    SearchEngineComponent,
    BuildingPageComponent,
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

  protected furnitureToEdit: FurnitureWithRelations | null = null

  public constructor() {
    this.furnitureService.get()
  }

  public openModal(furnitureId?: Furniture["id"]) {
    console.log("openModal", furnitureId)
    this.furnitureToEdit =
      this.furnitureService.furnitures.find((f) => {
        return f.id === furnitureId
      }) ?? null

    const modal = document.getElementById(
      "addFurnitureModal",
    ) as HTMLDialogElement
    modal.showModal()
  }

  public closeModal() {
    this.furnitureToEdit = null
    const modal = document.getElementById(
      "addFurnitureModal",
    ) as HTMLDialogElement
    modal.close()
  }
}
