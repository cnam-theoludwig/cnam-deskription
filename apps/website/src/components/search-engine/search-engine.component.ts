import { Component, inject } from "@angular/core"
import type { OnInit } from "@angular/core"
import { FurnitureService } from "../../services/furniture.service"
import type { FurnitureWithRelationsIdsType } from "@repo/models/Furniture"
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms"
import { BuildingService } from "../../services/building.service"
import { StateService } from "../../services/state.service"
import { TypeService } from "../../services/type.service"
import { StoreyService } from "../../services/storey.service"
import { RoomService } from "../../services/room.service"
import { toast } from "ngx-sonner"

@Component({
  selector: "app-search-engine",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./search-engine.component.html",
  styleUrls: ["./search-engine.component.css"],
})
export class SearchEngineComponent implements OnInit {
  protected furnitureSearchForm!: FormGroup
  private readonly fb = inject(FormBuilder)
  private readonly furnitureService = inject(FurnitureService)
  protected readonly buildingService = inject(BuildingService)
  protected readonly storeyService = inject(StoreyService)
  protected readonly roomService = inject(RoomService)
  protected readonly stateService = inject(StateService)
  protected readonly typeService = inject(TypeService)
  protected readonly toast = toast

  public constructor() {
    this.stateService.get()
    this.typeService.get()
    this.buildingService.get()
  }

  public ngOnInit() {
    this.furnitureSearchForm = this.furnitureService.createForm(this.fb, false)
  }

  public search() {
    const furnitureSearchParams: Partial<FurnitureWithRelationsIdsType> = {}

    if (this.furnitureSearchForm.invalid) {
      toast("Un nom de meuble doit contenir minimum 3 caractères.")
      return
    }

    const {
      name: nameValue,
      buildingId,
      storeyId,
      roomId,
      stateId,
      typeId,
    } = this.furnitureSearchForm.value

    const name = nameValue?.trim()

    if (name != null) {
      furnitureSearchParams.name = name
    }
    if (buildingId != null) {
      furnitureSearchParams.buildingId = buildingId
    }
    if (storeyId != null) {
      furnitureSearchParams.storeyId = storeyId
    }
    if (roomId != null) {
      furnitureSearchParams.roomId = roomId
    }
    if (stateId != null) {
      furnitureSearchParams.stateId = stateId
    }
    if (typeId != null) {
      furnitureSearchParams.typeId = typeId
    }

    this.furnitureService.search(furnitureSearchParams)
  }
}
