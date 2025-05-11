import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { BuildingCreate } from "@repo/models/Building"
import type { Status } from "@repo/utils/types"

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
}
