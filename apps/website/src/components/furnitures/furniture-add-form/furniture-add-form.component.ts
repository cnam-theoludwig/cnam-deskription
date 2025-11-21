import { Component, Output, EventEmitter, inject, Input } from "@angular/core"
import type { OnChanges, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms"
import { FurnitureService } from "../../../services/furniture.service"
import type {
  FurnitureCreate,
  FurnitureWithRelations,
} from "@repo/models/Furniture"
import { RequiredComponent } from "../../required/required.component"
import { StateService } from "../../../services/state.service"
import { TypeService } from "../../../services/type.service"
import { BuildingService } from "../../../services/building.service"
import { StoreyService } from "../../../services/storey.service"
import { RoomService } from "../../../services/room.service"
import type { LocationCreate } from "@repo/models/Location"
import { LocationService } from "../../../services/location.service"
import { firstValueFrom } from "rxjs"
import { DatePipe } from "@angular/common"

@Component({
  selector: "app-furniture-add-form",
  imports: [ReactiveFormsModule, RequiredComponent, DatePipe],
  templateUrl: "./furniture-add-form.component.html",
  styleUrl: "./furniture-add-form.component.css",
})
export class FurnitureAddFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder)
  private readonly furnitureService = inject(FurnitureService)
  private readonly locationService = inject(LocationService)
  protected readonly buildingService = inject(BuildingService)
  protected readonly storeyService = inject(StoreyService)
  protected readonly roomService = inject(RoomService)
  protected readonly stateService = inject(StateService)
  protected readonly typeService = inject(TypeService)

  @Input()
  public furniture: FurnitureWithRelations | null = null

  @Output()
  public handleClose = new EventEmitter<void>()

  protected furnitureForm!: FormGroup

  public constructor() {
    this.stateService.get()
    this.typeService.get()
    this.buildingService.get()
  }

  public ngOnInit() {
    this.furnitureForm = this.furnitureService.createForm(this.fb)
  }

  public async ngOnChanges() {
    if (this.furniture != null) {
      this.furnitureForm.patchValue({
        name: this.furniture.name,
        typeId: this.furniture.typeId,
        stateId: this.furniture.stateId,
        buildingId: this.furniture.buildingId,
      })

      await this.buildingService.onBuildingChange(this.furnitureForm)
      this.furnitureForm.patchValue({ storeyId: this.furniture.storeyId })
      await this.storeyService.onStoreyChange(this.furnitureForm)
      this.furnitureForm.patchValue({ roomId: this.furniture.roomId })
    }
  }

  public async onSubmit() {
    if (this.furnitureForm.invalid) {
      alert("Veuillez remplir correctement tous les champs.")
      return
    }

    try {
      const locationCreate: LocationCreate = {
        buildingId: this.furnitureForm.get("buildingId")?.value,
        storeyId: this.furnitureForm.get("storeyId")?.value,
        roomId: this.furnitureForm.get("roomId")?.value,
      }

      let location = await firstValueFrom(
        this.locationService.exists(locationCreate),
      )

      location ??= await firstValueFrom(
        this.locationService.create(locationCreate),
      )

      const data: FurnitureCreate = {
        name: this.furnitureForm.get("name")?.value,
        locationId: location.id,
        typeId: this.furnitureForm.get("typeId")?.value,
        stateId: this.furnitureForm.get("stateId")?.value,
      }

      if (this.furniture != null) {
        await firstValueFrom(
          this.furnitureService.update(this.furniture.id, data),
        )
      } else {
        await firstValueFrom(this.furnitureService.create(data))
      }

      this.closeModal()
    } catch (error) {
      console.error("Erreur lors de la création :", error)
      alert("Une erreur est survenue.")
    }
  }

  public async onDelete() {
  if (this.furniture === null) {
    return
  }

  if (!confirm("Voulez-vous vraiment supprimer ce meuble ?")) {
    return
  }

  try {
    await firstValueFrom(
      this.furnitureService.delete(this.furniture.id)
    )

    this.closeModal()
  } catch (error) {
    console.error("Erreur lors de la suppression :", error)
    alert("Impossible de supprimer cet élément.")
  }
}

  protected closeModal() {
    this.furnitureForm = this.furnitureService.createForm(this.fb)
    this.handleClose.emit()
  }
}
