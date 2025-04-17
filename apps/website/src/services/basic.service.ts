import { Injectable } from "@angular/core"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

import { getTRPCClient } from "@repo/api-client"
import { TRPC_PREFIX } from "@repo/utils/constants"
import { environment } from "../environments/environment"

@Injectable({
  providedIn: "root",
})
export class BasicService {
  private readonly client = getTRPCClient(environment.apiBaseURL + TRPC_PREFIX)

  public getTodos() {
    return fromPromise(this.client.greeting.query("Deskription"))
  }
}
