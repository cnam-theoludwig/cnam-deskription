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

  public exportToExcel() {
    const observable = fromPromise(
      this.rpcClient.furnitures.excelExport(this.furnitures),
    )

    const base64ToUint8Array = (base64: string) => {
      // remove data URL prefix if present
      const commaIndex = base64.indexOf(",")
      if (commaIndex !== -1) {
        base64 = base64.slice(commaIndex + 1)
      }
      // convert URL-safe base64 to standard
      base64 = base64.replace(/-/g, "+").replace(/_/g, "/")
      // add padding if missing
      const pad = base64.length % 4
      if (pad !== 0 && !Number.isNaN(pad)) {
        base64 += "====".slice(pad)
      }

      const binaryString = atob(base64)
      const len = binaryString.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return bytes
    }

    observable.subscribe({
      next: (base64) => {
        try {
          const bytes = base64ToUint8Array(base64)
          const blob = new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })

          // For IE/Edge
          const msSaveOrOpenBlob = (window.navigator as any).msSaveOrOpenBlob
          if (typeof msSaveOrOpenBlob === "function") {
            msSaveOrOpenBlob.call(window.navigator, blob, "furnitures.xlsx")
            return
          }

          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.setAttribute("download", "deskription.xlsx")
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } catch (error) {
          console.error("Failed to export excel:", error)
        }
      },
    })
    return observable
  }
}
