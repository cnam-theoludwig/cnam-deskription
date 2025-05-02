import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getTRPCClient } from "@repo/api-client"
import { TRPC_PREFIX } from "@repo/utils/constants"
import { environment } from "../environments/environment"
import type { FurnitureCreate } from "@repo/models/Furniture"

export type Furnitures = Awaited<
  ReturnType<ReturnType<typeof getTRPCClient>["furnitures"]["get"]["query"]>
>

@Injectable({
  providedIn: "root",
})
export class FurnitureService {
  private readonly client = getTRPCClient(environment.apiBaseURL + TRPC_PREFIX)
  private readonly _furnitures = signal<Furnitures>([])

  public get furnitures() {
    return this._furnitures()
  }

  public get() {
    const observable = fromPromise(this.client.furnitures.get.query())
    observable.subscribe({
      next: (furnitures) => {
        this._furnitures.set(furnitures)
      },
    })
    return observable
  }

  public create(input: FurnitureCreate) {
    const observable = fromPromise(this.client.furnitures.create.mutate(input))
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
