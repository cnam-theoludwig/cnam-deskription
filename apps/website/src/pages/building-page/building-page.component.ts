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

  protected selectedBuilding!: Building
  protected selectedStorey!: Storey
  protected selectedRoom!: Room
  protected selectedFurniture!: FurnitureWithRelations

  protected hideNotSelectedStoreysFlag: boolean = false
  protected floorPlans: Map<string, string> = new Map()

  public ngOnInit() {
    this.buildingService.get().subscribe({
      next: (buildings: Buildings) => {
        if (buildings[0] !== undefined) {
          this.selectBuilding(buildings[0])
        }
      },
    })
  }

  protected selectBuilding(building: Building) {
    console.log("selectBuilding", building.id)
    if (building !== undefined) {
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
    console.log("selectStorey", storey.id)
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
    console.log("selectRoom", room.id)
    if (room !== undefined) {
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
    console.log("selectFurniture", furniture.id)
    if (furniture) {
      this.selectedFurniture = furniture
    }
  }

  protected addBuilding() {
    console.log("Add building")
    const modal = document.getElementById(
      "addBuildingModal",
    ) as HTMLDialogElement
    modal.addEventListener(
      "close",
      () => {
        if (this.buildingService.buildings.length > 0) {
          const last =
            this.buildingService.buildings[
              this.buildingService.buildings.length - 1
            ]
          if (last !== undefined) {
            this.selectBuilding(last)
          }
        }
      },
      { once: true },
    )
    modal.showModal()
  }

  protected addStorey() {
    console.log("Add storey")
    const modal = document.getElementById("addStoreyModal") as HTMLDialogElement
    modal.addEventListener(
      "close",
      () => {
        if (this.storeyService.storeys.length > 0) {
          const last =
            this.storeyService.storeys[this.storeyService.storeys.length - 1]
          if (last !== undefined) {
            this.selectStorey(last)
          }
        }
      },
      { once: true },
    )
    modal.showModal()
  }

  protected addRoom() {
    console.log("Add room")
    const modal = document.getElementById("addRoomModal") as HTMLDialogElement
    modal.addEventListener(
      "close",
      () => {
        if (this.roomService.rooms.length > 0) {
          const last = this.roomService.rooms[this.roomService.rooms.length - 1]
          if (last !== undefined) {
            this.selectRoom(last)
          }
        }
      },
      { once: true },
    )
    modal.showModal()
  }

  protected addFurniture() {
    console.log("Add furniture")
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
    modal.showModal()
  }

  protected removeStorey(storey: Storey) {
    this.storeyService.remove(storey.id).subscribe({
      next: () => {
        if (this.storeyService.storeys[0] !== undefined) {
          this.selectedStorey = this.storeyService.storeys[0]
        }
      },
    })
  }

  protected removeRoom(room: Room) {
    this.roomService.delete(room.id).subscribe({
      next: () => {
        if (this.roomService.rooms[0] !== undefined) {
          this.selectedRoom = this.roomService.rooms[0]
        }
      },
    })
  }

  protected removeFurniture(furniture: FurnitureWithRelations) {
    console.log("Remove furniture", furniture)
  }

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

  protected onFloorPlanUploaded(event: {
    storeyId: string
    imageUrl: string
  }): void {
    console.log("Floor plan uploaded for storey:", event.storeyId)
    this.floorPlans.set(event.storeyId, event.imageUrl)

    this.storeyService
      .update(event.storeyId, { floorPlanImage: event.imageUrl })
      .subscribe({
        next: () => console.log("Floor plan saved to database"),
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
