import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { TypeCreate } from "@repo/models/Type"
import type { Status } from "@repo/utils/types"

export type Types = Awaited<
  ReturnType<ReturnType<typeof getRPCClient>["types"]["get"]>
>

@Injectable({
  providedIn: "root",
})
export class TypeService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)
  private readonly _types = signal<Types>([])
  private readonly _status = signal<Status>("pending")

  public get types() {
    return this._types()
  }

  public get status() {
    return this._status()
  }

  public get() {
    this._status.set("pending")
    const observable = fromPromise(this.rpcClient.types.get())
    observable.subscribe({
      next: (types) => {
        this._status.set("idle")
        this._types.set(types)
      },
    })
    return observable
  }

  public create(input: TypeCreate) {
    const observable = fromPromise(this.rpcClient.types.create(input))
    observable.subscribe({
      next: (newType) => {
        this._types.update((old) => {
          return [...old, newType]
        })
      },
    })
    return observable
  }
}
