import { inject, Injectable, signal } from "@angular/core"
import { from, Observable } from "rxjs"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type { Storey, StoreyCreate, StoreyUpdate } from "@repo/models/Storey"
import type { Status } from "@repo/utils/types"
import type { FormGroup } from "@angular/forms"
import { RoomService } from "./room.service"

export type Storeys = Storey[]

@Injectable({
  providedIn: "root",
})
export class StoreyService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)
  private readonly _storeys = signal<Storeys>([])
  private readonly _status = signal<Status>("idle")
  private readonly roomService = inject(RoomService)

  public get storeys() {
    return this._storeys()
  }

  public get status() {
    return this._status()
  }

  public clear() {
    this._storeys.set([])
  }

  public get() {
    this._status.set("pending")
    const observable = from(this.rpcClient.storeys.get()) as Observable<Storeys>
    observable.subscribe({
      next: (storeys: Storeys) => {
        this._status.set("idle")
        this._storeys.set(storeys)
      },
    })
    return observable
  }

  public getByBuildingId(buildingId: string) {
    this._status.set("pending")
    const observable = from(
      this.rpcClient.storeys.getByBuildingId(buildingId),
    ) as Observable<Storeys>
    observable.subscribe({
      next: (storeys: Storeys) => {
        this._status.set("idle")
        this._storeys.set(storeys)
      },
    })
    return observable
  }

  public create(input: StoreyCreate) {
    const observable = from(this.rpcClient.storeys.create(input))
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

  public remove(storeyId: Storey["id"]) {
    const observable = from(this.rpcClient.storeys.delete(storeyId))
    observable.subscribe({
      next: () => {
        this._storeys.update((old) => {
          return old.filter((storey) => {
            return storey.id !== storeyId
          })
        })
      },
    })
    return observable
  }

  public update(storeyId: Storey["id"], updates: Partial<StoreyUpdate>) {
    const observable = from(
      this.rpcClient.storeys.update({ id: storeyId, ...updates }),
    )
    observable.subscribe({
      next: (updatedStorey) => {
        this._storeys.update((old) => {
          return old.map((storey) => {
            return storey.id === storeyId ? updatedStorey : storey
          })
        })
      },
    })
    return observable
  }
  private readonly _storeyToEdit = signal<Storey | null>(null)

  public get storeyToEdit() {
    return this._storeyToEdit()
  }

  public openModal(storeyId?: string) {
    if (storeyId) {
      const storey = this._storeys().find((s) => s.id === storeyId)
      this._storeyToEdit.set(storey || null)
    } else {
      this._storeyToEdit.set(null)
    }

    const modal = document.getElementById("addStoreyModal") as HTMLDialogElement
    if (modal) modal.showModal()
  }

  public closeModal() {
    this._storeyToEdit.set(null)
    const modal = document.getElementById("addStoreyModal") as HTMLDialogElement
    if (modal) modal.close()
  }
}
