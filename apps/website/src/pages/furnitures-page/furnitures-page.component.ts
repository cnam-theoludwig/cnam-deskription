import { Component, inject } from "@angular/core"
import { HeaderComponent } from "../../components/header/header.component"
import { CommonModule } from "@angular/common"
import { FurnitureService } from "../../services/furniture.service"
import { FurnitureAddFormComponent } from "../../components/furnitures/furniture-add-form/furniture-add-form.component"
import { LocationService } from "../../services/location.service"
import { BuildingService } from "../../services/building.service"
import { StoreyService } from "../../services/storey.service"
import { RoomService } from "../../services/room.service"
import { StateService } from "../../services/state.service"
import { TypeService } from "../../services/type.service"

@Component({
  selector: "app-furnitures-page",
  imports: [CommonModule, HeaderComponent, FurnitureAddFormComponent],
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

  public constructor() {
    this.furnitureService.get()
  }

  public openModal() {
    const modal = document.getElementById(
      "addFurnitureModal",
    ) as HTMLDialogElement
    modal.showModal()
  }

  public closeModal() {
    const modal = document.getElementById(
      "addFurnitureModal",
    ) as HTMLDialogElement
    modal.close()
  }
}
