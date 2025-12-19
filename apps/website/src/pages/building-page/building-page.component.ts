import type { OnInit } from "@angular/core"
import { Component, inject } from "@angular/core"
import type { Building } from "@repo/models/Building"
import type { Room } from "@repo/models/Room"
import type { Storey } from "@repo/models/Storey"
import { filter, switchMap, tap } from "rxjs"
import { BuildingAddFormComponent } from "../../components/building-add-form/building-add-form.component"
import { BuildingViewer3dComponent } from "../../components/building-viewer/building-viewer.component"
import { ControlPanelComponent } from "../../components/control-panel/control-panel.component"
import { RoomAddFormComponent } from "../../components/room-add-form/room-add-form.component"
import { StoreyAddFormComponent } from "../../components/storey-add-form/storey-add-form.component"
import { BuildingService } from "../../services/building.service"
import { RoomService } from "../../services/room.service"
import { StoreyService } from "../../services/storey.service"

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

  protected selectedBuilding!: Building
  protected selectedStorey!: Storey

  protected selectedRoom!: Room
  protected hideNotSelectedStoreysFlag: boolean = false
  protected floorPlans: Map<string, string> = new Map()

  public ngOnInit() {
    this.buildingService
      .get()
      .pipe(
        // 1. On reçoit les bâtiments
        tap((buildings) => console.log("Buildings loaded:", buildings.length)),

        // On arrête si pas de bâtiment
        filter((buildings) => buildings.length > 0),

        // On sélectionne le premier et on charge ses étages
        tap((buildings) => {
          if (buildings[0]) {
            this.selectedBuilding = buildings[0]
          }
        }),
        switchMap((buildings) =>
          this.storeyService.getByBuildingId(buildings[0]?.id ?? ""),
        ),

        // 2. On reçoit les étages
        tap((storeys) => console.log("Storeys loaded:", storeys.length)),
        filter((storeys) => storeys.length > 0),

        // On sélectionne le premier étage et on charge ses pièces
        tap((storeys) => {
          if (storeys[0]) {
            this.selectedStorey = storeys[0]
          }
          // Load existing floor plans
          this.loadFloorPlans(storeys)
        }),
        switchMap((storeys) =>
          this.roomService.getByStoreyId(storeys[0]?.id ?? ""),
        ),

        // 3. On reçoit les pièces
        tap((rooms) => console.log("Rooms loaded:", rooms.length)),
        filter((rooms) => rooms.length > 0),
        tap((rooms) => {
          if (rooms[0]) {
            this.selectedRoom = rooms[0]
          }
        }),
      )
      .subscribe({
        error: (err) => console.error("Erreur de chargement:", err),
      })
  }

  protected selectBuilding(building: Building) {
    console.log("selectBuilding", building.id)
    if (building !== undefined) {
      this.selectedBuilding = building
      this.storeyService.getByBuildingId(building.id).subscribe({
        next: (storeys) => {
          if (storeys[0] !== undefined) {
            this.selectedStorey = storeys[0]
          }
          // Load floor plans for the new building
          this.loadFloorPlans(storeys)
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
            this.selectedRoom = rooms[0]
          }
        },
      })
    }
  }

  protected selectRoom(room: Room) {
    console.log("selectRoom", room.id)
    if (room !== undefined) {
      this.selectedRoom = room
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
            console.log("New building added:", last)
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
            console.log("New storey added:", last)
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
            console.log("New room added:", last)
            this.selectRoom(last)
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

  protected updateRoom(updatedRoom: Room) {
    console.log("Update room", updatedRoom)

    this.roomService
      .update(updatedRoom.id, {
        name: updatedRoom.name,
        color: updatedRoom.color,
      })
      .subscribe({
        next: (res) => {
          console.log("Room updated successfully", res)
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
