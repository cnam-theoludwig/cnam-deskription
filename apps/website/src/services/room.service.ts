import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { RoomCreate } from "@repo/models/Room"
import type { Status } from "@repo/utils/types"

export type Rooms = Awaited<
  ReturnType<ReturnType<typeof getRPCClient>["rooms"]["get"]>
>

@Injectable({
  providedIn: "root",
})
export class RoomService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)
  private readonly _rooms = signal<Rooms>([])
  private readonly _status = signal<Status>("idle")

  public get rooms() {
    return this._rooms()
  }

  public get status() {
    return this._status()
  }

  public get() {
    this._status.set("pending")
    const observable = fromPromise(this.rpcClient.rooms.get())
    observable.subscribe({
      next: (rooms) => {
        this._status.set("idle")
        this._rooms.set(rooms)
      },
    })
    return observable
  }

  public getByStoreyId(storeyId: string) {
    this._status.set("pending")
    const observable = fromPromise(this.rpcClient.rooms.getByStoreyId(storeyId))
    observable.subscribe({
      next: (rooms) => {
        this._status.set("idle")
        this._rooms.set(rooms)
      },
    })
    return observable
  }

  public create(input: RoomCreate) {
    const observable = fromPromise(this.rpcClient.rooms.create(input))
    observable.subscribe({
      next: (newRoom) => {
        this._rooms.update((old) => {
          return [...old, newRoom]
        })
      },
    })
    return observable
  }
}
