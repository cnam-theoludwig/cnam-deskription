import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { StateCreate } from "@repo/models/State"
import type { Status } from "@repo/utils/types"

export type States = Awaited<
  ReturnType<ReturnType<typeof getRPCClient>["states"]["get"]>
>

@Injectable({
  providedIn: "root",
})
export class StateService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)
  private readonly _states = signal<States>([])
  private readonly _status = signal<Status>("pending")

  public get states() {
    return this._states()
  }

  public get status() {
    return this._status()
  }

  public get() {
    this._status.set("pending")
    const observable = fromPromise(this.rpcClient.states.get())
    observable.subscribe({
      next: (states) => {
        this._status.set("idle")
        this._states.set(states)
      },
    })
    return observable
  }

  public create(input: StateCreate) {
    const observable = fromPromise(this.rpcClient.states.create(input))
    observable.subscribe({
      next: (newState) => {
        this._states.update((old) => {
          return [...old, newState]
        })
      },
    })
    return observable
  }
}
