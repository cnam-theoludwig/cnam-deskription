import { Injectable, signal } from "@angular/core"
import { from, Observable } from "rxjs"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { Type, TypeCreate } from "@repo/models/Type"
import type { Status } from "@repo/utils/types"

export type Types = Type[]

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
    const observable = from(this.rpcClient.types.get()) as Observable<Types>
    observable.subscribe({
      next: (types) => {
        this._status.set("idle")
        this._types.set(types)
      },
    })
    return observable
  }

  public create(input: TypeCreate) {
    const observable = from(
      this.rpcClient.types.create(input),
    ) as Observable<Type>
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
