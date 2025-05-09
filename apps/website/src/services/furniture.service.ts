import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { FurnitureCreate } from "@repo/models/Furniture"
import type { Status } from "@repo/utils/types"

export type Furnitures = Awaited<
  ReturnType<ReturnType<typeof getRPCClient>["furnitures"]["get"]>
>

@Injectable({
  providedIn: "root",
})
export class FurnitureService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)
  private readonly _furnitures = signal<Furnitures>([])
  private readonly _furnituresStatus = signal<Status>("pending")

  public get furnitures() {
    return this._furnitures()
  }

  public get furnituresStatus() {
    return this._furnituresStatus()
  }

  public get() {
    this._furnituresStatus.set("pending")
    const observable = fromPromise(this.rpcClient.furnitures.get())
    observable.subscribe({
      next: (furnitures) => {
        this._furnituresStatus.set("idle")
        this._furnitures.set(furnitures)
      },
    })
    return observable
  }

  public create(input: FurnitureCreate) {
    const observable = fromPromise(this.rpcClient.furnitures.create(input))
    observable.subscribe({
      next: (newFurniture) => {
        this._furnitures.update((old) => {
          return [...old, newFurniture]
        })
      },
    })
    return observable
  }
}
