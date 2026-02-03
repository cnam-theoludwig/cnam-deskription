import {
  Component,
  inject,
  effect,
  Input,
  Output,
  EventEmitter,
  type OnChanges,
  type SimpleChanges,
} from "@angular/core"
import { RoleService } from "../../../services/role.service"
import { ReactiveFormsModule, FormsModule } from "@angular/forms"
import { RequiredComponent } from "../../required/required.component"
import { ButtonModule } from "primeng/button"
import { SelectModule } from "primeng/select"
import { InputTextModule } from "primeng/inputtext"
import { DatePipe } from "@angular/common"
import { HistoryLogService } from "../../../services/historylog.service"
import { FormBuilder, FormGroup } from "@angular/forms"
import { FurnitureService } from "../../../services/furniture.service"
import { LocationService } from "../../../services/location.service"
import { BuildingService } from "../../../services/building.service"
import { StoreyService } from "../../../services/storey.service"
import { RoomService } from "../../../services/room.service"
import { StateService } from "../../../services/state.service"
import { TypeService } from "../../../services/type.service"
import type {
  FurnitureCreate,
  FurnitureWithRelations,
} from "@repo/models/Furniture"
import type { LocationCreate } from "@repo/models/Location"
import { firstValueFrom } from "rxjs"

@Component({
  selector: "app-furniture-add-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RequiredComponent,
    ButtonModule,
    DatePipe,
    SelectModule,
    InputTextModule,
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
  protected readonly historyLogService = inject(HistoryLogService)
  protected readonly roleService = inject(RoleService)

  @Input()
  public furniture: FurnitureWithRelations | null = null

  @Input() public canModifyPositionCallback: (() => boolean) | null = null

  @Input() public defaultBuildingId?: string
  @Input() public defaultStoreyId?: string
  @Input() public defaultRoomId?: string
  @Input() public modalId: string = "addFurnitureModal"

  @Output()
  public handleClose = new EventEmitter<void>()

  protected furnitureForm!: FormGroup

  public constructor() {
    this.stateService.get()
    this.typeService.get()
    this.buildingService.get()

    this.furnitureForm = this.furnitureService.createForm(this.fb)

    effect(async () => {
      const furnitureToEdit = this.furnitureService.furnitureToEdit()
      console.log("Effect triggered. Furniture:", furnitureToEdit)

      this.furnitureForm.reset()
      this.furnitureForm.get("storeyId")?.disable()
      this.furnitureForm.get("roomId")?.disable()

      if (furnitureToEdit) {
        console.log("Patching furniture details...")
        this.furnitureForm.patchValue({
          name: furnitureToEdit.name,
          typeId: furnitureToEdit.typeId,
          stateId: furnitureToEdit.stateId,
          buildingId: furnitureToEdit.buildingId,
          model: furnitureToEdit.model,
        })

        if (furnitureToEdit.buildingId) {
          console.log(
            "Fetching storeys for building:",
            furnitureToEdit.buildingId,
          )
          this.storeyService.getByBuildingId(furnitureToEdit.buildingId)
          this.furnitureForm.get("storeyId")?.enable()
          this.furnitureForm.patchValue({ storeyId: furnitureToEdit.storeyId })
        }

        if (furnitureToEdit.storeyId) {
          console.log("Fetching rooms for storey:", furnitureToEdit.storeyId)
          this.roomService.getByStoreyId(furnitureToEdit.storeyId)
          this.furnitureForm.get("roomId")?.enable()
          this.furnitureForm.patchValue({ roomId: furnitureToEdit.roomId })
        }
      } else {
        console.log("Add mode - using defaults")
        this.applyDefaults()
      }
      console.log("Form Value after patch:", this.furnitureForm.value)
    })
  }

  public ngOnChanges(_: SimpleChanges) {
    if (!this.furnitureService.furnitureToEdit()) {
      this.applyDefaults()
    }
  }

  private applyDefaults() {
    if (this.defaultBuildingId) {
      this.furnitureForm.patchValue({ buildingId: this.defaultBuildingId })
      this.storeyService.getByBuildingId(this.defaultBuildingId)
      this.furnitureForm.get("storeyId")?.enable()

      if (this.defaultStoreyId) {
        this.furnitureForm.patchValue({ storeyId: this.defaultStoreyId })
        this.roomService.getByStoreyId(this.defaultStoreyId)
        this.furnitureForm.get("roomId")?.enable()

        if (this.defaultRoomId) {
          this.furnitureForm.patchValue({ roomId: this.defaultRoomId })
        } else {
          this.furnitureForm.patchValue({ roomId: null })
        }
      } else {
        this.furnitureForm.patchValue({ storeyId: null, roomId: null })
        this.furnitureForm.get("roomId")?.disable()
      }
    } else {
      this.furnitureForm.patchValue({
        buildingId: null,
        storeyId: null,
        roomId: null,
      })
      this.furnitureForm.get("storeyId")?.disable()
      this.furnitureForm.get("roomId")?.disable()
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

      const currentFurniture = this.furnitureService.furnitureToEdit()

      if (currentFurniture) {
        await firstValueFrom(
          this.historyLogService.update(currentFurniture.id, data),
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

  protected closeModal() {
    this.furnitureForm = this.furnitureService.createForm(this.fb)
    this.applyDefaults()

    if (this.modalId !== "addFurnitureModal") {
      const modal = document.getElementById(this.modalId) as HTMLDialogElement
      if (modal) modal.close()
    }

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
