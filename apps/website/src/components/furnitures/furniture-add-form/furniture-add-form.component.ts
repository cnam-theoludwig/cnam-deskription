import { Component, Output, EventEmitter } from "@angular/core"
import type { OnInit } from "@angular/core"
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
import { StateService } from "../../../services/state.service"
import { TypeService } from "../../../services/type.service"
import { BuildingService } from "../../../services/building.service"
import { StoreyService } from "../../../services/storey.service"
import { RoomService } from "../../../services/room.service"
import type { LocationCreate, Location } from "@repo/models/Location"
import { LocationService } from "../../../services/location.service"
import { firstValueFrom } from "rxjs"

@Component({
  selector: "app-furniture-add-form",
  imports: [ReactiveFormsModule, RequiredComponent],
  templateUrl: "./furniture-add-form.component.html",
  styleUrl: "./furniture-add-form.component.css",
})
export class FurnitureAddFormComponent implements OnInit {
  @Output()
  public handleClose = new EventEmitter<void>()

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

  public ngOnInit() {
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

  public async checkIfLocationExists() {
    const locationCreate = {
      buildingId: this.furnitureForm.get("building")?.value,
      storeyId: this.furnitureForm.get("storey")?.value,
      roomId: this.furnitureForm.get("room")?.value,
    } as LocationCreate

    let location: Location | null = await firstValueFrom(
      this.locationService.exists(locationCreate),
    )

    location ??= await firstValueFrom(
      this.locationService.create(locationCreate),
    )

    return location
  }

  public async onSubmit() {
    if (!this.furnitureForm.valid) {
      alert("Veuillez remplir correctement tous les champs.")
      return
    }

    await this.checkIfLocationExists().then(async (location) => {
      const data: FurnitureCreate = {
        name: this.furnitureForm.get("name")?.value,
        locationId: location.id,
        typeId: this.furnitureForm.get("type")?.value,
        stateId: this.furnitureForm.get("state")?.value,
      }

      await firstValueFrom(this.furnitureService.create(data))
    })

    this.closeModal()
  }

  protected closeModal() {
    this.handleClose.emit()
  }

  protected onBuildingChange() {
    const buildingId = this.furnitureForm.get("building")?.value
    if (buildingId == null) {
      return
    }
    this.furnitureForm.get("room")?.setValue("")
    this.furnitureForm.get("storey")?.setValue("")

    this.storeyService.getByBuildingId(buildingId)
    this.furnitureForm.get("storey")?.enable()
    this.furnitureForm.get("room")?.disable()
  }

  protected onStoreyChange() {
    const storeyId = this.furnitureForm.get("storey")?.value
    if (storeyId == null) {
      return
    }

    this.roomService.getByStoreyId(storeyId)
    this.furnitureForm.get("room")?.enable()
  }
}
