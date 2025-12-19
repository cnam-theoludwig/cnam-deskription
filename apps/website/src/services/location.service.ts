import { Injectable, signal } from "@angular/core"
import { from, Observable } from "rxjs"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { Location, LocationCreate } from "@repo/models/Location"
import type { Status } from "@repo/utils/types"

export type Locations = Location[]

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
    const observable = from(
      this.rpcClient.locations.get(),
    ) as Observable<Locations>
    observable.subscribe({
      next: (locations) => {
        this._status.set("idle")
        this._locations.set(locations)
      },
    })
    return observable
  }

  public exists(locationCreate: LocationCreate): Observable<Location | null> {
    this._status.set("pending")
    const observable = from(
      this.rpcClient.locations.exists(locationCreate),
    ) as Observable<Location | null>
    observable.subscribe({
      next: () => {
        this._status.set("idle")
      },
    })
    return observable
  }

  public create(input: LocationCreate): Observable<Location> {
    const observable = from(
      this.rpcClient.locations.create(input),
    ) as Observable<Location>
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
