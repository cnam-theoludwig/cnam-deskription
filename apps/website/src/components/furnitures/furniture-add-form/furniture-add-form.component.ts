import {
  inject,
  Input,
  Output,
  EventEmitter,
  Component,
  type OnChanges,
  type SimpleChanges,
} from "@angular/core"
import { RoleService } from "../../../services/role.service"
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms"
import { RequiredComponent } from "../../required/required.component"
import { ButtonModule } from "primeng/button"
import { DatePipe } from "@angular/common"
import { FurnitureService } from "../../../services/furniture.service"
import { LocationService } from "../../../services/location.service"
import { BuildingService } from "../../../services/building.service"
import { StoreyService } from "../../../services/storey.service"
import { RoomService } from "../../../services/room.service"
import { StateService } from "../../../services/state.service"
import { TypeService } from "../../../services/type.service"
import { QrGeneratorComponent } from "../../../app/components/qr-generator/qr-generator.component"
import type {
  FurnitureCreate,
  FurnitureWithRelations,
} from "@repo/models/Furniture"
import type { LocationCreate } from "@repo/models/Location"
import { firstValueFrom } from "rxjs"
import { SelectModule } from "primeng/select"
import { InputTextModule } from "primeng/inputtext"

@Component({
  selector: "app-furniture-add-form",
  imports: [
    ReactiveFormsModule,
    RequiredComponent,
    ButtonModule,
    DatePipe,
    SelectModule,
    InputTextModule,
    QrGeneratorComponent,
  ],
  templateUrl: "./furniture-add-form.component.html",
  styleUrl: "./furniture-add-form.component.css",
})
export class FurnitureAddFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder)
  protected readonly furnitureService = inject(FurnitureService)
  private readonly locationService = inject(LocationService)
  protected readonly buildingService = inject(BuildingService)
  protected readonly storeyService = inject(StoreyService)
  protected readonly roomService = inject(RoomService)
  protected readonly stateService = inject(StateService)
  protected readonly typeService = inject(TypeService)
  protected readonly roleService = inject(RoleService)

  @Input() public defaultBuildingId?: string
  @Input() public defaultStoreyId?: string
  @Input() public defaultRoomId?: string

  @Input()
  public set furniture(val: FurnitureWithRelations | null) {
    void this.handleFurnitureEditChange(val)
  }

  @Output()
  public handleClose = new EventEmitter<void>()

  protected furnitureForm!: FormGroup

  public constructor() {
    this.stateService.get()
    this.typeService.get()
    this.buildingService.get()

    this.furnitureForm = this.furnitureService.createForm(this.fb)
  }

  public async ngOnChanges(changes: SimpleChanges) {
    if (
      (changes["defaultBuildingId"] ||
        changes["defaultStoreyId"] ||
        changes["defaultRoomId"]) &&
      !this.furnitureService.furnitureToEdit
    ) {
      this.furnitureForm.reset()
      await this.applyDefaults()
    }
  }

  private async handleFurnitureEditChange(
    furnitureToEdit: FurnitureWithRelations | null,
  ) {
    this.furnitureForm.reset()
    this.furnitureForm.get("storeyId")?.disable()
    this.furnitureForm.get("roomId")?.disable()

    if (furnitureToEdit) {
      this.furnitureForm.patchValue({
        name: furnitureToEdit.name,
        typeId: furnitureToEdit.typeId,
        stateId: furnitureToEdit.stateId,
        buildingId: furnitureToEdit.buildingId,
        model: furnitureToEdit.model,
      })

      if (furnitureToEdit.buildingId) {
        await this.buildingService.onBuildingChange(this.furnitureForm)
        this.furnitureForm.patchValue({ storeyId: furnitureToEdit.storeyId })
      }

      if (furnitureToEdit.storeyId) {
        await this.storeyService.onStoreyChange(this.furnitureForm)
        this.furnitureForm.patchValue({ roomId: furnitureToEdit.roomId })
      }
    } else {
      await this.applyDefaults()
    }
    this.updatePositionFieldsState()
  }

  private updatePositionFieldsState() {
    this.furnitureForm.get("buildingId")?.enable()

    // Refresh cascading state
    const buildingId = this.furnitureForm.get("buildingId")?.value
    if (!buildingId) {
      this.furnitureForm.get("storeyId")?.disable()
      this.furnitureForm.get("roomId")?.disable()
    }

    const storeyId = this.furnitureForm.get("storeyId")?.value
    if (!storeyId) {
      this.furnitureForm.get("roomId")?.disable()
    }
  }

  private async applyDefaults() {
    if (this.defaultBuildingId) {
      this.furnitureForm.patchValue({ buildingId: this.defaultBuildingId })
      await this.buildingService.onBuildingChange(this.furnitureForm)

      if (this.defaultStoreyId) {
        this.furnitureForm.patchValue({ storeyId: this.defaultStoreyId })
        await this.storeyService.onStoreyChange(this.furnitureForm)

        if (this.defaultRoomId) {
          this.furnitureForm.patchValue({ roomId: this.defaultRoomId })
        }
      }
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
        x: 0,
        z: 0,
        model: this.furnitureForm.get("model")?.value,
      }

      const currentFurniture = this.furnitureService.furnitureToEdit

      if (currentFurniture) {
        await firstValueFrom(
          this.furnitureService.updateForm(currentFurniture.id, data),
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
    const furnitureToEdit = this.furnitureService.furnitureToEdit
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

  protected closeModal() {
    this.furnitureForm = this.furnitureService.createForm(this.fb)
    this.handleClose.emit()
  }

  // Vérifier si le rôle actuel peut modifier la position
  protected get canModifyPosition(): boolean {
    return this.roleService.currentRole === "Gestionnaire de mobilier"
  }

  // Vérifier si le rôle actuel peut affecter/désaffecter
  protected get canAssign(): boolean {
    return this.roleService.currentRole === "Responsable de site"
  }

  // Vérifier si le rôle actuel peut gérer le stockage
  protected get canManageStorage(): boolean {
    return this.roleService.currentRole === "Gestionnaire de mobilier"
  }

  // Vérifier si le rôle actuel peut voir l'historique
  protected get canViewHistory(): boolean {
    return (
      this.roleService.currentRole === "Utilisateur" ||
      this.roleService.currentRole === "Loueur de mobilier"
    )
  }

  // Vérifier si le rôle actuel peut voir l'état fonctionnel
  protected get canViewFunctionalState(): boolean {
    return (
      this.roleService.currentRole === "Loueur de mobilier" ||
      this.roleService.currentRole === "Utilisateur"
    )
  }

  // Vérifier si les champs de position doivent être désactivés
  protected get shouldDisablePositionFields(): boolean {
    return this.furniture != null && !this.canModifyPosition
  }

  // Méthode pour le scan/GPS
  protected onScanGPS() {
    alert(
      "Fonctionnalité de mise à jour automatique (scan/GPS) à implémenter plus tard.",
    )
  }

  // Méthode pour affecter/désaffecter
  protected onAssign() {
    alert(
      "Fonctionnalité d'affectation/désaffectation à implémenter plus tard.",
    )
  }

  // Méthode pour stocker le mobilier
  protected onStore() {
    alert("Fonctionnalité de stockage à implémenter plus tard.")
  }

  // Méthode pour céder le mobilier stocké
  protected onDispose() {
    alert("Fonctionnalité de cession à implémenter plus tard.")
  }

  // Méthode pour voir l'historique
  protected onViewHistory() {
    alert("Fonctionnalité d'historique à implémenter plus tard.")
  }

  // Méthode pour voir l'état fonctionnel
  protected onViewFunctionalState() {
    alert("Visualisation d'état fonctionnel à implémenter plus tard.")
  }
}
