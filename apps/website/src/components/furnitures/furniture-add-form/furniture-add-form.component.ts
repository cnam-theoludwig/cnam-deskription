import { Component, Output, type OnInit } from "@angular/core"
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms"
import { FurnitureService } from "../../../services/furniture.service"
import type { FurnitureCreate } from "@repo/models/Furniture"
import { RequiredComponent } from "../../required/required.component"
import { EventEmitter } from "@angular/core"
import { StateService } from "../../../services/state.service"
import { TypeService } from "../../../services/type.service"
import { BuildingService } from "../../../services/building.service"
import { StoreyService } from "../../../services/storey.service"
import { RoomService } from "../../../services/room.service"
import { type LocationCreate, type Location } from "@repo/models/Location"
import { LocationService } from "../../../services/location.service"
import { firstValueFrom } from "rxjs"

@Component({
  selector: "app-furniture-add-form",
  imports: [ReactiveFormsModule, RequiredComponent],
  templateUrl: "./furniture-add-form.component.html",
  styleUrl: "./furniture-add-form.component.css",
})
export class FurnitureAddFormComponent implements OnInit {
  @Output() close = new EventEmitter<void>()

  protected furnitureForm!: FormGroup

  public constructor(
    private readonly fb: FormBuilder,
    private readonly furnitureService: FurnitureService,
    private readonly locationService: LocationService,
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

  ngOnInit() {
    this.furnitureForm = this.fb.group({
      name: new FormControl("", Validators.required),
      building: new FormControl("", Validators.required),
      storey: new FormControl(
        { value: "", disabled: true },
        Validators.required,
      ),
      room: new FormControl({ value: "", disabled: true }, Validators.required),
      type: new FormControl("", Validators.required),
      state: new FormControl("", Validators.required),
    })
  }

  async checkIfLocationExists() {
    const locationCreate = {
      building_id: this.furnitureForm.get("building")?.value,
      storey_id: this.furnitureForm.get("storey")?.value,
      room_id: this.furnitureForm.get("room")?.value,
    } as LocationCreate

    let location: Location | null = await firstValueFrom(
      this.locationService.exists(locationCreate),
    )

    if (location === null) {
      location = await firstValueFrom(
        this.locationService.create(locationCreate),
      )
    }

    return location
  }

  async onSubmit() {
    if (!this.furnitureForm.valid) {
      alert("Veuillez remplir correctement tous les champs.")
      return
    }

    await this.checkIfLocationExists().then(async (location) => {
      console.log("Location ", location)

      // Ensuite on crée le meuble
      const data: FurnitureCreate = {
        name: this.furnitureForm.get("name")?.value,
        location_id: location.id,
        type_id: this.furnitureForm.get("type")?.value,
        state_id: this.furnitureForm.get("state")?.value,
      }

      console.log("Data: ", data)

      await firstValueFrom(this.furnitureService.create(data)).then(
        (furniture) => {
          console.log("Furniture created: ", furniture)
        },
      )
    })

    this.closeModal()
  }

  protected closeModal() {
    this.close.emit()
  }

  protected onBuildingChange() {
    const buildingId = this.furnitureForm.get("building")?.value
    if (!buildingId) return
    this.furnitureForm.get("room")?.setValue("")
    this.furnitureForm.get("storey")?.setValue("")

    this.storeyService.getByBuildingId(buildingId)
    this.furnitureForm.get("storey")?.enable()
    this.furnitureForm.get("room")?.disable()
  }

  protected onStoreyChange() {
    const storeyId = this.furnitureForm.get("storey")?.value
    if (!storeyId) return

    this.roomService.getByStoreyId(storeyId)
    this.furnitureForm.get("room")?.enable()
  }
}
