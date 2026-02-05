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
  protected showAllStoreyFurnituresFlag: boolean = false
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
    if (building !== undefined) {
      this.selectedBuilding = building
      this.storeyService.clear()
      this.roomService.clear()
      this.furnitureService.clear()
      this.selectedStorey = undefined!
      this.selectedRoom = undefined!
      this.selectedFurniture = undefined!

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
    if (storey !== undefined) {
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
    if (room !== undefined) {
      this.selectedRoom = room
      this.fetchFurnitures()
    }
  }

  private fetchFurnitures() {
    if (this.showAllStoreyFurnituresFlag && this.selectedStorey) {
      this.furnitureService.getByStoreyId(this.selectedStorey.id).subscribe({
        next: (furnitures) => {
          const first = furnitures[0]
          if (first && !this.selectedFurniture) {
            this.selectFurniture(first)
          }
        },
      })
    } else if (this.selectedRoom) {
      this.furnitureService.getByRoomId(this.selectedRoom.id).subscribe({
        next: (furnitures) => {
          if (furnitures[0] !== undefined) {
            this.selectFurniture(furnitures[0])
          }
        },
      })
    }
  }

  protected selectFurniture(furniture: FurnitureWithRelations) {
    if (furniture !== undefined) {
      if (furniture) {
        this.selectedFurniture = furniture
      }
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
    const modal = document.getElementById(
      "addBuildingModal",
    ) as HTMLDialogElement
    if (!modal) return

    modal.addEventListener(
      "close",
      () => {
        if (this.buildingService.buildings.length > 0) {
          const last =
            this.buildingService.buildings[
              this.buildingService.buildings.length - 1
            ]
          if (last) this.selectBuilding(last)
        }
      },
      { once: true },
    )
    modal.showModal()
  }

  protected addStorey() {
    const modal = document.getElementById("addStoreyModal") as HTMLDialogElement
    if (!modal) return

    modal.addEventListener(
      "close",
      () => {
        if (this.storeyService.storeys.length > 0) {
          const last =
            this.storeyService.storeys[this.storeyService.storeys.length - 1]
          if (last) this.selectStorey(last)
        }
      },
      { once: true },
    )
    modal.showModal()
  }

  protected addRoom() {
    const modal = document.getElementById("addRoomModal") as HTMLDialogElement
    if (!modal) return

    modal.addEventListener(
      "close",
      () => {
        if (this.roomService.rooms.length > 0) {
          const last = this.roomService.rooms[this.roomService.rooms.length - 1]
          if (last) this.selectRoom(last)
        }
      },
      { once: true },
    )
    modal.showModal()
  }

  protected addFurniture() {
    this.furnitureService.openModal()

    const modal = document.getElementById(
      "addFurnitureModal",
    ) as HTMLDialogElement
    modal.addEventListener(
      "close",
      () => {
        if (this.furnitureService.furnitures.length > 0) {
          const last =
            this.furnitureService.furnitures[
              this.furnitureService.furnitures.length - 1
            ]
          if (last !== undefined) {
            this.selectFurniture(last)
          }
        }
      },
      { once: true },
    )
  }

  protected removeBuilding(building: Building) {
    this.buildingService.delete(building.id).subscribe({
      next: () => {
        if (this.buildingService.buildings[0] !== undefined) {
          this.selectBuilding(this.buildingService.buildings[0])
        } else {
          this.selectedBuilding = undefined!
          this.selectedStorey = undefined!
          this.selectedRoom = undefined!
          this.selectedFurniture = undefined!
          this.storeyService.clear()
          this.roomService.clear()
          this.furnitureService.clear()
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
    this.furnitureService.delete(furniture.id).subscribe({
      next: () => {
        this.selectedFurniture = undefined!
      },
    })
  }

  // --- Autres ---

  protected updateRoom(updatedRoom: Room) {
    this.roomService
      .update(updatedRoom.id, {
        name: updatedRoom.name,
        color: updatedRoom.color,
      })
      .subscribe({
        next: (res) => {
          this.selectedRoom = res
        },
        error: (err) => console.error("Failed to update room", err),
      })
  }

  public setHideNotSelectedStoreys(hide: boolean) {
    this.hideNotSelectedStoreysFlag = hide
  }

  public hideNotSelectedStoreys(): boolean {
    return this.hideNotSelectedStoreysFlag && this.selectedStorey != null
  }

  public toggleShowAllStoreyFurnitures(show: boolean) {
    this.showAllStoreyFurnituresFlag = show
    this.fetchFurnitures()
  }

  protected onFloorPlanUploaded(event: {
    storeyId: string
    imageUrl: string
  }): void {
    this.floorPlans.set(event.storeyId, event.imageUrl)
    this.storeyService
      .update(event.storeyId, { floorPlanImage: event.imageUrl })
      .subscribe({
        next: () => {},
        error: (err) => console.error("Failed to save floor plan:", err),
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
