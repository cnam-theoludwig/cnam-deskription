import { Component  } from "@angular/core"
import type {OnInit} from "@angular/core";
import { FurnitureService } from "../../services/furniture.service"
import type { FurnitureWithRelationsIdsType } from "@repo/models/Furniture"
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms"
import { BuildingService } from "../../services/building.service"
import { StateService } from "../../services/state.service"
import { TypeService } from "../../services/type.service"
import { StoreyService } from "../../services/storey.service"
import { RoomService } from "../../services/room.service"

@Component({
  selector: "app-search-engine",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./search-engine.component.html",
  styleUrls: ["./search-engine.component.css"],
})
export class SearchEngineComponent implements OnInit {
  protected furnitureSearchForm!: FormGroup

  public constructor(
    private readonly fb: FormBuilder,
    private readonly furnitureService: FurnitureService,
    protected readonly buildingService: BuildingService,
    protected readonly storeyService: StoreyService,
    protected readonly roomService: RoomService,
    protected readonly stateService: StateService,
    protected readonly typeService: TypeService,
  ) {
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
      alert("Un nom de meuble doit contenir minimum 3 caractères.")
      return
    }

    const { name, buildingId, storeyId, roomId, stateId, typeId } =
      this.furnitureSearchForm.value
    console.log("Search parameters:", this.furnitureSearchForm.value)

    if (name?.trim()) {furnitureSearchParams.name = name.trim()}
    if (buildingId) {furnitureSearchParams.buildingId = buildingId}
    if (storeyId) {furnitureSearchParams.storeyId = storeyId}
    if (roomId) {furnitureSearchParams.roomId = roomId}
    if (stateId) {furnitureSearchParams.stateId = stateId}
    if (typeId) {furnitureSearchParams.typeId = typeId}

    this.furnitureService.search(furnitureSearchParams)
  }
}
