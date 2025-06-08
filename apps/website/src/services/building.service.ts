import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { BuildingCreate } from "@repo/models/Building"
import type { Status } from "@repo/utils/types"
import type { FormGroup } from "@angular/forms"
import { StoreyService } from "./storey.service"

export type Buildings = Awaited<
  ReturnType<ReturnType<typeof getRPCClient>["buildings"]["get"]>
>

@Injectable({
  providedIn: "root",
})
export class BuildingService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)
  private readonly _buildings = signal<Buildings>([])
  private readonly _status = signal<Status>("pending")

  constructor(private readonly storeyService: StoreyService) {}

  public get buildings() {
    return this._buildings()
  }

  public get status() {
    return this._status()
  }

  public get() {
    this._status.set("pending")
    const observable = fromPromise(this.rpcClient.buildings.get())
    observable.subscribe({
      next: (buildings) => {
        this._status.set("idle")
        this._buildings.set(buildings)
      },
    })
    return observable
  }

  public create(input: BuildingCreate) {
    const observable = fromPromise(this.rpcClient.buildings.create(input))
    observable.subscribe({
      next: (newBuilding) => {
        this._buildings.update((old) => {
          return [...old, newBuilding]
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
