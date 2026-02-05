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
import {
  BuildingService,
  type Buildings,
} from "../../services/building.service"
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
  protected showAllStoreyFurnituresFlag: boolean = false
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
      this.selectedFurniture = furniture
    }
  }

  protected addBuilding() {
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
    this.furnitureService.delete(furniture.id).subscribe({
      next: () => {
        this.selectedFurniture = undefined!
      },
    })
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
