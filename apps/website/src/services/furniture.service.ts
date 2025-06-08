import { Injectable, signal } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type {
  FurnitureCreate,
  FurnitureWithRelationsIdsType,
} from "@repo/models/Furniture"
import type { Status } from "@repo/utils/types"
import { FormControl, Validators } from "@angular/forms"
import type { FormBuilder, FormGroup } from "@angular/forms"

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

  public createForm(fb: FormBuilder, required: boolean = true): FormGroup {
    const requiredValidator = required ? Validators.required : null

    return fb.group({
      name: new FormControl("", [
        Validators.minLength(3),
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

  public search(input: Partial<FurnitureWithRelationsIdsType>) {
    this._status.set("pending")
    console.log("Searching furnitures with input:", input)
    const observable = fromPromise(this.rpcClient.furnitures.search(input))
    observable.subscribe({
      next: (furnitures) => {
        this._status.set("idle")
        this._furnitures.set(furnitures)
      },
    })
    return observable
  }
}
