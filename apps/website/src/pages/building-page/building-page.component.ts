import { Component, inject } from "@angular/core"
import type { OnInit } from "@angular/core"
import { BuildingViewer3dComponent } from "../../components/building-viewer/building-viewer.component"
import { ControlPanelComponent } from "../../components/control-panel/control-panel.component"
import { BuildingService } from "../../services/building.service"
import type { Building } from "@repo/models/Building"
import { BuildingAddFormComponent } from "../../components/building-add-form/building-add-form.component"
import { StoreyService } from "../../services/storey.service"
import type { Storey } from "@repo/models/Storey"
import { StoreyAddFormComponent } from "../../components/storey-add-form/storey-add-form.component"

@Component({
  selector: "app-building-manager",
  templateUrl: "./building-page.component.html",
  imports: [
    BuildingViewer3dComponent,
    ControlPanelComponent,
    BuildingAddFormComponent,
    StoreyAddFormComponent,
  ],
  styleUrls: ["./building-page.component.css"],
})
export class BuildingPageComponent implements OnInit {
  protected readonly buildingService = inject(BuildingService)
  protected readonly storeyService = inject(StoreyService)
  protected selectedBuilding!: Building
  protected selectedStorey!: Storey

  public ngOnInit() {
    this.buildingService.get().subscribe({
      next: (buildings) => {
        console.log("Buildings:", buildings)
        if (buildings[0] !== undefined) {
          this.selectedBuilding = buildings[0]
          this.storeyService
            .getByBuildingId(this.selectedBuilding.id)
            .subscribe({
              next: (storeys) => {
                if (storeys[0] !== undefined) {
                  this.selectedStorey = storeys[0]
                }
              },
            })
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
          if (storeys[0] !== undefined) {
            this.selectedStorey = storeys[0]
          }
        },
      })
    }
  }

  protected selectStorey(storey: Storey) {
    console.log("selectStorey", storey.id)
    if (storey !== undefined) {
      this.selectedStorey = storey
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

  protected removeStorey(storey: Storey) {
    this.storeyService.remove(storey.id).subscribe({
      next: () => {
        if (this.storeyService.storeys[0] !== undefined) {
          this.selectedStorey = this.storeyService.storeys[0]
        }
      },
    })
  }
}
