import { Component, inject } from "@angular/core"
import type { OnInit } from "@angular/core"
import { FurnitureService } from "../../services/furniture.service"
import type { FurnitureWithRelations } from "@repo/models/Furniture"
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms"
import { BuildingService } from "../../services/building.service"
import { StateService } from "../../services/state.service"
import { TypeService } from "../../services/type.service"
import { StoreyService } from "../../services/storey.service"
import { RoomService } from "../../services/room.service"
import { ButtonModule } from "primeng/button"
import { SelectModule } from "primeng/select"
import { InputTextModule } from "primeng/inputtext"
import { IconFieldModule } from "primeng/iconfield"
import { InputIconModule } from "primeng/inputicon"

@Component({
  selector: "app-search-engine",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: "./search-engine.component.html",
  styleUrls: ["./search-engine.component.css"],
})
export class SearchEngineComponent implements OnInit {
  protected furnitureSearchForm!: FormGroup
  private readonly formBuilder = inject(FormBuilder)
  private readonly furnitureService = inject(FurnitureService)
  protected readonly buildingService = inject(BuildingService)
  protected readonly storeyService = inject(StoreyService)
  protected readonly roomService = inject(RoomService)
  protected readonly stateService = inject(StateService)
  protected readonly typeService = inject(TypeService)

  public constructor() {
    this.stateService.get()
    this.typeService.get()
    this.buildingService.get()
  }

  public ngOnInit() {
    this.furnitureSearchForm = this.furnitureService.createForm(
      this.formBuilder,
      false,
      false,
    )
  }

  public search() {
    const furnitureSearchParams: Partial<FurnitureWithRelations> = {}
    const { name, buildingId, storeyId, roomId, stateId, typeId } =
      this.furnitureSearchForm.value

    if (name != null && name.length > 0) {
      furnitureSearchParams.name = name
    }
    if (buildingId != null && buildingId.length > 0) {
      furnitureSearchParams.buildingId = buildingId
    }
    if (storeyId != null && storeyId.length > 0) {
      furnitureSearchParams.storeyId = storeyId
    }
    if (roomId != null && roomId.length > 0) {
      furnitureSearchParams.roomId = roomId
    }
    if (stateId != null && stateId.length > 0) {
      furnitureSearchParams.stateId = stateId
    }
    if (typeId != null && typeId.length > 0) {
      furnitureSearchParams.typeId = typeId
    }

    this.furnitureService.search(furnitureSearchParams)
  }

  public reset(): void {
    this.furnitureSearchForm.reset()
    this.search()
  }
}
