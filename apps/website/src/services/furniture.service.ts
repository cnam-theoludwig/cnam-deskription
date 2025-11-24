import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type {
  Furniture,
  FurnitureCreate,
  FurnitureWithRelations,
} from "@repo/models/Furniture"
import type { Status } from "@repo/utils/types"
import { FormControl, Validators } from "@angular/forms"
import type { FormBuilder, FormGroup } from "@angular/forms"
import type { Room } from "@repo/models/Room"

export type Furnitures = Awaited<
  ReturnType<ReturnType<typeof getRPCClient>["furnitures"]["get"]>
>

@Injectable({
  providedIn: "root",
})
export class FurnitureService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)

  private readonly _furnitures = signal<Furnitures>([])
  private readonly _status = signal<Status>("pending")

  public readonly furnitureToEdit = signal<FurnitureWithRelations | null>(null)

  public get furnitures() {
    return this._furnitures()
  }

  public get status() {
    return this._status()
  }

  public get() {
    this._status.set("pending")
    const observable = fromPromise(this.rpcClient.furnitures.get())
    observable.subscribe({
      next: (furnitures) => {
        this._status.set("idle")
        this._furnitures.set(furnitures)
      },
    })
    return observable
  }

  public getByRoomId(roomId: Room["id"]) {
    this._status.set("pending")
    const observable = fromPromise(
      this.rpcClient.furnitures.getByRoomId({ roomId }),
    )
    observable.subscribe({
      next: (furnitures) => {
        this._status.set("idle")
        this._furnitures.set(furnitures)
      },
    })
    return observable
  }

  public fetchForRender(roomId: string) {
    return fromPromise(this.rpcClient.furnitures.getByRoomId({ roomId }))
  }

  public search(input: Partial<FurnitureWithRelations>) {
    this._status.set("pending")
    const observable = fromPromise(this.rpcClient.furnitures.search(input))
    observable.subscribe({
      next: (furnitures) => {
        this._status.set("idle")
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

  public update(id: Furniture["id"], furniture: FurnitureCreate) {
    this._status.set("pending")
    const observable = fromPromise(
      this.rpcClient.furnitures.update({ id, furniture }),
    )
    observable.subscribe({
      next: (updatedFurniture) => {
        this._status.set("idle")
        this._furnitures.update((old) => {
          return old.map((furniture) => {
            return furniture.id === updatedFurniture.id
              ? updatedFurniture
              : furniture
          })
        })
      },
    })
    return observable
  }

  public createForm(
    fb: FormBuilder,
    required: boolean = true,
    hasMinLength: boolean = true,
  ): FormGroup {
    const requiredValidator = required ? Validators.required : null

    return fb.group({
      name: new FormControl("", [
        ...(hasMinLength ? [Validators.minLength(3)] : []),
        ...(required ? [Validators.required] : []),
      ]),
      buildingId: new FormControl("", requiredValidator),
      storeyId: new FormControl(
        { value: "", disabled: true },
        requiredValidator,
      ),
      roomId: new FormControl({ value: "", disabled: true }, requiredValidator),
      typeId: new FormControl("", requiredValidator),
      stateId: new FormControl("", requiredValidator),
    })
  }

  public openModal(furniture?: FurnitureWithRelations) {
    this.furnitureToEdit.set(furniture ?? null)
    const modal = document.getElementById(
      "addFurnitureModal",
    ) as HTMLDialogElement

    if (!modal) return

    modal.addEventListener(
      "close",
      () => {
        this.furnitureToEdit.set(null)
      },
      { once: true },
    )
    modal.showModal()
  }

  public closeModal() {
    const modal = document.getElementById(
      "addFurnitureModal",
    ) as HTMLDialogElement
    if (modal) modal.close()
  }

  public delete(id: Furniture["id"]) {
    this._status.set("pending")

    const observable = fromPromise(this.rpcClient.furnitures.delete(id))

    observable.subscribe({
      next: () => {
        this._status.set("idle")
        this._furnitures.update((old) => {
          return old.filter((f) => {
            return f.id !== id
          })
        })
      },
    })

    return observable
  }
}
