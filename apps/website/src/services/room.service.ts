import { Injectable, signal } from "@angular/core"
import { from, Observable } from "rxjs"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { Room, RoomCreate } from "@repo/models/Room"
import type { Status } from "@repo/utils/types"

export type Rooms = Room[]

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
    const observable = from(this.rpcClient.rooms.get()) as Observable<Rooms>
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
    const observable = from(
      this.rpcClient.rooms.getByStoreyId(storeyId),
    ) as Observable<Rooms>
    observable.subscribe({
      next: (rooms) => {
        this._status.set("idle")
        this._rooms.set(rooms)
      },
    })
    return observable
  }

  public fetchByStoreyId(storeyId: string) {
    return from(
      this.rpcClient.rooms.getByStoreyId(storeyId),
    ) as Observable<Rooms>
  }

  public create(input: RoomCreate) {
    const observable = from(this.rpcClient.rooms.create(input))
    observable.subscribe({
      next: (newRoom) => {
        this._rooms.update((old) => {
          return [...old, newRoom]
        })
      },
    })
    return observable
  }

  public update(id: Room["id"], input: Partial<Room>) {
    const observable = from(this.rpcClient.rooms.update({ id, ...input }))
    observable.subscribe({
      next: (updatedRoom) => {
        this._rooms.update((old) => {
          return old.map((room) => {
            if (room.id === updatedRoom.id) {
              return updatedRoom
            }
            return room
          })
        })
      },
    })
    return observable
  }

  public delete(id: Room["id"]) {
    console.log("Delete room", id)
    const observable = from(this.rpcClient.rooms.delete(id))
    observable.subscribe({
      next: (deletedRoom) => {
        this._rooms.update((old) => {
          return old.filter((room) => {
            return room.id !== deletedRoom.id
          })
        })
      },
    })
    return observable
  }
}
