import { inject, Injectable, signal } from "@angular/core"
import { from, Observable } from "rxjs"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { Building, BuildingCreate } from "@repo/models/Building"
import type { Status } from "@repo/utils/types"
import type { FormGroup } from "@angular/forms"
import { StoreyService } from "./storey.service"

export type Buildings = Building[]

@Injectable({
  providedIn: "root",
})
export class BuildingService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)
  private readonly _buildings = signal<Buildings>([])
  private readonly _status = signal<Status>("pending")
  private readonly storeyService = inject(StoreyService)

  public get buildings() {
    return this._buildings()
  }

  public get status() {
    return this._status()
  }

  public get() {
    this._status.set("pending")
    const observable = from(
      this.rpcClient.buildings.get(),
    ) as Observable<Buildings>
    observable.subscribe({
      next: (buildings: Building[]) => {
        this._status.set("idle")
        this._buildings.set(buildings)
      },
    })
    return observable
  }

  public create(input: BuildingCreate) {
    const observable = from(this.rpcClient.buildings.create(input))
    observable.subscribe({
      next: (newBuilding: Building) => {
        this._buildings.update((old) => {
          return [...old, newBuilding]
        })
      },
    })
    return observable
  }

  public remove(buildingId: Building["id"]) {
    const observable = from(this.rpcClient.buildings.delete(buildingId))
    observable.subscribe({
      next: () => {
        this._buildings.update((old) => {
          return old.filter((buildings) => {
            return buildings.id !== buildingId
          })
        })
      },
    })
    return observable
  }

  public onBuildingChange(
    formGroup: FormGroup,
    buildingAttributeName: string = "buildingId",
    storeyAttributeName: string = "storeyId",
    roomAttributeName: string = "roomId",
  ) {
    const buildingId = formGroup.get(buildingAttributeName)?.value
    if (buildingId == null) {
      return
    }
    formGroup.get(roomAttributeName)?.setValue("")
    formGroup.get(storeyAttributeName)?.setValue("")

    this.storeyService.getByBuildingId(buildingId)
    formGroup.get(storeyAttributeName)?.enable()
    formGroup.get(roomAttributeName)?.disable()
  }
}
