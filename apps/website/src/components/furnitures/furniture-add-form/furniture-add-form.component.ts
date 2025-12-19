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
import { RoleService } from "../../../services/role.service"
import { ButtonModule } from "primeng/button"
import { DatePipe } from "@angular/common"

@Component({
  selector: "app-furniture-add-form",
  imports: [ReactiveFormsModule, RequiredComponent, ButtonModule, DatePipe],
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
  protected readonly roleService = inject(RoleService)

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

      this.buildingService.onBuildingChange(this.furnitureForm)
      this.furnitureForm.patchValue({ storeyId: this.furniture.storeyId })
      this.storeyService.onStoreyChange(this.furnitureForm)
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
      await firstValueFrom(this.furnitureService.delete(this.furniture.id))

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
