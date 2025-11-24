import { Component, inject, effect } from "@angular/core"
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms"
import { FurnitureService } from "../../../services/furniture.service"
import { RequiredComponent } from "../../required/required.component"
import { StateService } from "../../../services/state.service"
import { TypeService } from "../../../services/type.service"
import { BuildingService } from "../../../services/building.service"
import { StoreyService } from "../../../services/storey.service"
import { RoomService } from "../../../services/room.service"
import { LocationService } from "../../../services/location.service"
import type { LocationCreate } from "@repo/models/Location"
import type { FurnitureCreate } from "@repo/models/Furniture"
import { firstValueFrom } from "rxjs"
import { DatePipe } from "@angular/common"

@Component({
  selector: "app-furniture-add-form",
  imports: [ReactiveFormsModule, RequiredComponent, DatePipe],
  templateUrl: "./furniture-add-form.component.html",
  styleUrl: "./furniture-add-form.component.css",
})
export class FurnitureAddFormComponent {
  private readonly fb = inject(FormBuilder)
  protected readonly furnitureService = inject(FurnitureService)
  private readonly locationService = inject(LocationService)
  protected readonly buildingService = inject(BuildingService)
  protected readonly storeyService = inject(StoreyService)
  protected readonly roomService = inject(RoomService)
  protected readonly stateService = inject(StateService)
  protected readonly typeService = inject(TypeService)

  protected furnitureForm!: FormGroup

  public constructor() {
    this.stateService.get()
    this.typeService.get()
    this.buildingService.get()

    this.furnitureForm = this.furnitureService.createForm(this.fb)

    effect(async () => {
      const furnitureToEdit = this.furnitureService.furnitureToEdit()

      this.furnitureForm.reset()
      this.furnitureForm.get("storeyId")?.disable()
      this.furnitureForm.get("roomId")?.disable()

      if (furnitureToEdit) {
        this.furnitureForm.patchValue({
          name: furnitureToEdit.name,
          typeId: furnitureToEdit.typeId,
          stateId: furnitureToEdit.stateId,
          buildingId: furnitureToEdit.buildingId,
        })

        if (furnitureToEdit.buildingId) {
          await this.buildingService.onBuildingChange(this.furnitureForm)
          this.furnitureForm.patchValue({ storeyId: furnitureToEdit.storeyId })
        }

        if (furnitureToEdit.storeyId) {
          await this.storeyService.onStoreyChange(this.furnitureForm)
          this.furnitureForm.patchValue({ roomId: furnitureToEdit.roomId })
        }
      }
    })
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
        x: 0,
        z: 0,
        model: "",
      }

      const currentFurniture = this.furnitureService.furnitureToEdit()

      if (currentFurniture) {
        await firstValueFrom(
          this.furnitureService.update(currentFurniture.id, data),
        )
      } else {
        await firstValueFrom(this.furnitureService.create(data))
      }

      this.furnitureService.closeModal()
    } catch (error) {
      console.error("Erreur lors de la création :", error)
      alert("Une erreur est survenue.")
    }
  }

  public async onDelete() {
    const furnitureToEdit = this.furnitureService.furnitureToEdit()
    if (!furnitureToEdit) {
      return
    }

    if (!confirm("Voulez-vous vraiment supprimer ce meuble ?")) {
      return
    }

    try {
      await firstValueFrom(this.furnitureService.delete(furnitureToEdit.id))

      this.furnitureService.closeModal()
    } catch (error) {
      console.error("Erreur lors de la suppression :", error)
      alert("Impossible de supprimer cet élément.")
    }
  }
}
