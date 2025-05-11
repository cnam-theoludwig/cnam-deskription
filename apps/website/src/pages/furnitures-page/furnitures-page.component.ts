import { Component } from "@angular/core"
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
  public constructor(
    protected readonly furnitureService: FurnitureService,
    protected readonly locationService: LocationService,
    protected readonly buildingService: BuildingService,
    protected readonly storeyService: StoreyService,
    protected readonly roomService: RoomService,
    protected readonly stateService: StateService,
    protected readonly typeService: TypeService,
  ) {
    this.furnitureService.get()
  }

  openModal() {
    const modal = document.getElementById(
      "addFurnitureModal",
    ) as HTMLDialogElement
    if (modal) {
      modal.showModal()
    }
  }

  closeModal() {
    const modal = document.getElementById(
      "addFurnitureModal",
    ) as HTMLDialogElement
    if (modal) {
      modal.close()
    }
  }
}
