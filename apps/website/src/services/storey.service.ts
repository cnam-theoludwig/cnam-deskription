import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { StoreyCreate } from "@repo/models/Storey"
import type { Status } from "@repo/utils/types"
import type { FormGroup } from "@angular/forms"
import { RoomService } from "./room.service"

export type Storeys = Awaited<
  ReturnType<ReturnType<typeof getRPCClient>["storeys"]["get"]>
>

@Injectable({
  providedIn: "root",
})
export class StoreyService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)
  private readonly _storeys = signal<Storeys>([])
  private readonly _status = signal<Status>("idle")

  constructor(private readonly roomService: RoomService) {}

  public get storeys() {
    return this._storeys()
  }

  public get status() {
    return this._status()
  }

  public get() {
    this._status.set("pending")
    const observable = fromPromise(this.rpcClient.storeys.get())
    observable.subscribe({
      next: (storeys) => {
        this._status.set("idle")
        this._storeys.set(storeys)
      },
    })
    return observable
  }

  public getByBuildingId(buildingId: string) {
    this._status.set("pending")
    const observable = fromPromise(
      this.rpcClient.storeys.getByBuildingId(buildingId),
    )
    observable.subscribe({
      next: (storeys) => {
        this._status.set("idle")
        this._storeys.set(storeys)
      },
    })
    return observable
  }

  public create(input: StoreyCreate) {
    const observable = fromPromise(this.rpcClient.storeys.create(input))
    observable.subscribe({
      next: (newStorey) => {
        this._storeys.update((old) => {
          return [...old, newStorey]
        })
      },
    })
    return observable
  }

  public onStoreyChange(
    formGroup: FormGroup,
    storeyAttributeName: string = "storeyId",
    roomAttributeName: string = "roomId",
  ) {
    const storeyId = formGroup.get(storeyAttributeName)?.value
    if (storeyId == null) {
      return
    }

    this.roomService.getByStoreyId(storeyId)
    formGroup.get(roomAttributeName)?.enable()
  }
}
