import type { OnInit } from "@angular/core"
import { Component, inject } from "@angular/core"
import type { Building } from "@repo/models/Building"
import type { Room } from "@repo/models/Room"
import type { Storey } from "@repo/models/Storey"
import { BuildingAddFormComponent } from "../../components/building-add-form/building-add-form.component"
import { BuildingViewer3dComponent } from "../../components/building-viewer/building-viewer.component"
import { ControlPanelComponent } from "../../components/control-panel/control-panel.component"
import { RoomAddFormComponent } from "../../components/room-add-form/room-add-form.component"
import { StoreyAddFormComponent } from "../../components/storey-add-form/storey-add-form.component"
import { FurnitureAddFormComponent } from "../../components/furnitures/furniture-add-form/furniture-add-form.component"
import { QrScanModalComponent } from "../../app/components/qr-scan-modal/qr-scan-modal.component"
import { BuildingService } from "../../services/building.service"
import type { Buildings } from "../../services/building.service"
import { RoomService } from "../../services/room.service"
import { StoreyService } from "../../services/storey.service"
import type { FurnitureWithRelations } from "@repo/models/Furniture"
import { FurnitureService } from "../../services/furniture.service"

@Component({
  selector: "app-building-manager",
  templateUrl: "./building-page.component.html",
  imports: [
    BuildingViewer3dComponent,
    ControlPanelComponent,
    BuildingAddFormComponent,
    StoreyAddFormComponent,
    RoomAddFormComponent,
    FurnitureAddFormComponent,
    QrScanModalComponent,
  ],
  styleUrls: ["./building-page.component.css"],
})
export class BuildingPageComponent implements OnInit {
  protected readonly buildingService = inject(BuildingService)
  protected readonly storeyService = inject(StoreyService)
  protected readonly roomService = inject(RoomService)
  protected readonly furnitureService = inject(FurnitureService)

  // Variables optionnelles '?' pour gérer la suppression
  protected selectedBuilding?: Building
  protected selectedStorey?: Storey
  protected selectedRoom?: Room
  protected selectedFurniture?: FurnitureWithRelations

  protected hideNotSelectedStoreysFlag: boolean = false
  protected floorPlans: Map<string, string> = new Map()

  public ngOnInit() {
    this.buildingService.get().subscribe({
      next: (buildings: Buildings) => {
        // Correction : On vérifie que le premier élément existe avant de l'envoyer
        const firstBuilding = buildings[0]
        if (firstBuilding) {
          this.selectBuilding(firstBuilding)
        }
      },
    })
  }

  protected selectBuilding(building: Building) {
    // Sécurité supplémentaire : si building est undefined (via l'UI), on arrête
    if (!building) return;

    console.log("selectBuilding", building.id)
    this.selectedBuilding = building
    
    this.storeyService.getByBuildingId(building.id).subscribe({
      next: (storeys) => {
        this.loadFloorPlans(storeys)
        const firstStorey = storeys[0]
        if (firstStorey) {
          this.selectStorey(firstStorey)
        } else {
          // Reset des enfants si pas d'étage
          this.selectedStorey = undefined
          this.selectedRoom = undefined
          this.selectedFurniture = undefined
        }
      },
    })
  }

  protected selectStorey(storey: Storey) {
    if (!storey) return; // Sécurité

    console.log("selectStorey", storey.id)
    this.selectedStorey = storey
    this.roomService.getByStoreyId(storey.id).subscribe({
      next: (rooms) => {
        const firstRoom = rooms[0]
        if (firstRoom) {
          this.selectRoom(firstRoom)
        } else {
          this.selectedRoom = undefined
          this.selectedFurniture = undefined
        }
      },
    })
  }

  protected selectRoom(room: Room) {
    if (!room) return; // Sécurité

    console.log("selectRoom", room.id)
    this.selectedRoom = room
    this.furnitureService.getByRoomId(room.id).subscribe({
      next: (furnitures) => {
        const firstFurniture = furnitures[0]
        if (firstFurniture) {
          this.selectFurniture(firstFurniture)
        } else {
          this.selectedFurniture = undefined
        }
      },
    })
  }

  protected selectFurniture(furniture: FurnitureWithRelations) {
    if (this.selectedBuilding?.id === building?.id) {
      console.log("Building already selected:", building.id)
      return
    }

    console.log("selectBuilding", building.id)
    if (building) {
      this.selectedBuilding = building
      this.storeyService.getByBuildingId(building.id).subscribe({
        next: (storeys) => {
          this.loadFloorPlans(storeys)
          if (storeys[0] !== undefined) {
            this.selectStorey(storeys[0])
          }
        },
      })
    }
  }

  protected selectStorey(storey: Storey) {
    // Optimisation : éviter de re-sélectionner le même étage
    if (this.selectedStorey?.id === storey?.id) {
      console.log("Storey already selected:", storey.id)
      return
    }

    console.log("selectStorey", storey.id)
    if (storey) {
      this.selectedStorey = storey
      this.roomService.getByStoreyId(storey.id).subscribe({
        next: (rooms) => {
          if (rooms[0] !== undefined) {
            this.selectRoom(rooms[0])
          }
        },
      })
    }
  }

  protected selectRoom(room: Room) {
    // Optimisation : éviter de re-sélectionner la même pièce
    if (this.selectedRoom?.id === room?.id) {
      console.log("Room already selected:", room.id)
      return
    }

    console.log("selectRoom", room.id)
    if (room) {
      this.selectedRoom = room
      this.furnitureService.getByRoomId(room.id).subscribe({
        next: (furnitures) => {
          if (furnitures[0] !== undefined) {
            this.selectFurniture(furnitures[0])
          }
        },
      })
    }
  }

  protected selectFurniture(furniture: FurnitureWithRelations) {
    // Optimisation : éviter de re-sélectionner le même meuble
    if (this.selectedFurniture?.id === furniture?.id) {
      console.log("Furniture already selected:", furniture.id)
      return
    }

    console.log("selectFurniture", furniture.id)
    if (furniture) {
      this.selectedFurniture = furniture
    }
  }

  /**
   * Navigation automatique vers un meuble scanné via QR code
   * Remonte toute la hiérarchie : Building > Storey > Room > Furniture
   */
  protected navigateToScannedFurniture(furniture: FurnitureWithRelations) {
    console.log("Navigating to scanned furniture:", furniture.id)

    // Charger le building si ce n'est pas déjà le bon
    if (
      !this.selectedBuilding ||
      this.selectedBuilding.id !== furniture.buildingId
    ) {
      const building = this.buildingService.buildings.find(
        (b) => b.id === furniture.buildingId,
      )
      if (building) {
        this.selectBuilding(building)
      }
    }

    // Charger l'étage si ce n'est pas déjà le bon
    if (!this.selectedStorey || this.selectedStorey.id !== furniture.storeyId) {
      this.storeyService.getByBuildingId(furniture.buildingId).subscribe({
        next: (storeys) => {
          const storey = storeys.find((s) => s.id === furniture.storeyId)
          if (storey) {
            this.selectStorey(storey)
            this.loadRoomAndFurniture(furniture)
          }
        },
      })
    } else {
      this.loadRoomAndFurniture(furniture)
    }
  }

  /**
   * Méthode auxiliaire pour charger la pièce et sélectionner le meuble
   */
  private loadRoomAndFurniture(furniture: FurnitureWithRelations) {
    // Charger la pièce si ce n'est pas déjà la bonne
    if (!this.selectedRoom || this.selectedRoom.id !== furniture.roomId) {
      this.roomService.getByStoreyId(furniture.storeyId).subscribe({
        next: (rooms) => {
          const room = rooms.find((r) => r.id === furniture.roomId)
          if (room) {
            this.selectRoom(room)

            // Sélectionner le meuble après un court délai pour s'assurer que la pièce est chargée
            setTimeout(() => {
              this.selectFurniture(furniture)
            }, 100)
          }
        },
      })
    } else {
      // La pièce est déjà sélectionnée, juste sélectionner le meuble
      this.selectFurniture(furniture)
    }
  }

  protected addBuilding() {
    const modal = document.getElementById("addBuildingModal") as HTMLDialogElement
    if (!modal) return
    
    modal.addEventListener("close", () => {
        if (this.buildingService.buildings.length > 0) {
          const last = this.buildingService.buildings[this.buildingService.buildings.length - 1]
          if (last) this.selectBuilding(last)
        }
      }, { once: true })
    modal.showModal()
  }

  protected addStorey() {
    const modal = document.getElementById("addStoreyModal") as HTMLDialogElement
    if (!modal) return

    modal.addEventListener("close", () => {
        if (this.storeyService.storeys.length > 0) {
          const last = this.storeyService.storeys[this.storeyService.storeys.length - 1]
          if (last) this.selectStorey(last)
        }
      }, { once: true })
    modal.showModal()
  }

  protected addRoom() {
    const modal = document.getElementById("addRoomModal") as HTMLDialogElement
    if (!modal) return

    modal.addEventListener("close", () => {
        if (this.roomService.rooms.length > 0) {
          const last = this.roomService.rooms[this.roomService.rooms.length - 1]
          if (last) this.selectRoom(last)
        }
      }, { once: true })
    modal.showModal()
  }

  // --- Suppression ---

  protected removeBuilding(building: Building) {
    this.buildingService.remove(building.id).subscribe({
      next: () => {
        const first = this.buildingService.buildings[0]
        if (first) {
          this.selectedBuilding = first
        } else {
          this.selectedBuilding = undefined
        }
      },
    })
  }

  protected removeStorey(storey: Storey) {
    this.storeyService.remove(storey.id).subscribe({
      next: () => {
        const first = this.storeyService.storeys[0]
        if (first) {
          this.selectedStorey = first
        } else {
          this.selectedStorey = undefined
        }
      },
    })
  }

  protected removeRoom(room: Room) {
    this.roomService.delete(room.id).subscribe({
      next: () => {
        const first = this.roomService.rooms[0]
        if (first) {
          this.selectedRoom = first
        } else {
          this.selectedRoom = undefined
        }
      },
    })
  }

  protected removeFurniture(furniture: FurnitureWithRelations) {
    // Implémentation future
    console.log("Remove furniture", furniture)
  }

  // --- Autres ---

  protected updateRoom(updatedRoom: Room) {
    this.roomService
      .update(updatedRoom.id, {
        name: updatedRoom.name,
        color: updatedRoom.color,
      })
      .subscribe({
        next: (res) => { this.selectedRoom = res },
        error: (err) => console.error("Failed to update room", err),
      })
  }

  public setHideNotSelectedStoreys(hide: boolean) {
    this.hideNotSelectedStoreysFlag = hide
  }

  public hideNotSelectedStoreys(): boolean {
    return this.hideNotSelectedStoreysFlag && this.selectedStorey != null
  }

  protected onFloorPlanUploaded(event: {
    storeyId: string
    imageUrl: string
  }): void {
    this.floorPlans.set(event.storeyId, event.imageUrl)
    this.storeyService
      .update(event.storeyId, { floorPlanImage: event.imageUrl })
      .subscribe({
        next: () => console.log("Plan sauvegardé"),
        error: (err) => console.error("Erreur plan", err),
      })
  }

  private loadFloorPlans(storeys: Storey[]): void {
    for (const storey of storeys) {
      if (storey.floorPlanImage) {
        this.floorPlans.set(storey.id, storey.floorPlanImage)
      }
    }
  }
}