import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { LocationCreate } from "@repo/models/Location"
import type { Status } from "@repo/utils/types"

export type Locations = Awaited<
  ReturnType<ReturnType<typeof getRPCClient>["locations"]["get"]>
>

@Injectable({
  providedIn: "root",
})
export class LocationService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)
  private readonly _locations = signal<Locations>([])
  private readonly _status = signal<Status>("idle")

  public get locations() {
    return this._locations()
  }

  public get status() {
    return this._status()
  }

  public get() {
    this._status.set("pending")
    const observable = fromPromise(this.rpcClient.locations.get())
    observable.subscribe({
      next: (locations) => {
        this._status.set("idle")
        this._locations.set(locations)
      },
    })
    return observable
  }

  public exists(locationCreate: LocationCreate) {
    this._status.set("pending")
    const observable = fromPromise(
      this.rpcClient.locations.exists(locationCreate),
    )
    observable.subscribe({
      next: () => {
        this._status.set("idle")
      },
    })
    return observable
  }

  public create(input: LocationCreate) {
    const observable = fromPromise(this.rpcClient.locations.create(input))
    observable.subscribe({
      next: (newLocation) => {
        this._locations.update((old) => {
          return [...old, newLocation]
        })
      },
    })
    return observable
  }
}
