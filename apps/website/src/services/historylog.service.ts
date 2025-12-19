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

export type HistoryLog = Awaited<
  ReturnType<ReturnType<typeof getRPCClient>["historylogs"]["update"]>
>

@Injectable({
  providedIn: "root",
})
export class HistoryLogService {
  private readonly rpcClient = getRPCClient(environment.apiBaseURL)

  private readonly _historylog = signal<HistoryLog | null>(null)
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
    const observable = fromPromise(
      this.rpcClient.historylogs.update({ id, furniture }),
    )
    observable.subscribe({
      next: (updatedHistorylog) => {
        this._status.set("idle")
        this._historylog.set(updatedHistorylog)
      },
    })
    return observable
  }
}
