import { Injectable, signal } from "@angular/core"
import { from } from "rxjs"

import { getRPCClient } from "@repo/api-client"
import { environment } from "../environments/environment"
import type {
  Furniture,
  FurnitureCreate,
  FurnitureWithRelations,
} from "@repo/models/Furniture"
import type { HistoryLog } from "@repo/models/HistoryLog"
import type { Status } from "@repo/utils/types"

@Injectable({
  providedIn: "root",
})
export class HistoryLogService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)

  private readonly _historylog = signal<HistoryLog[] | null>(null)
  private readonly _status = signal<Status>("pending")

  public readonly furnitureToEdit = signal<FurnitureWithRelations | null>(null)

  public get historylog() {
    return this._historylog()
  }

  public get status() {
    return this._status()
  }

  public update(id: Furniture["id"], furniture: FurnitureCreate) {
    this._status.set("pending")
    const observable = from(
      this.rpcClient.historylogs.update({ id, furniture }),
    )
    observable.subscribe({
      next: (updatedFurniture) => {
        this._status.set("idle")
        this._historylog.set(updatedFurniture.historyLogs)
      },
    })
    return observable
  }
}
