import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class QrScanService {
  public openScanModal() {
    const modal = document.getElementById("qrScanModal") as HTMLDialogElement

    if (!modal) return

    modal.addEventListener(
      "close",
      () => {
        // Nettoyage si nécessaire
      },
      { once: true },
    )
    modal.showModal()
  }

  public closeScanModal() {
    const modal = document.getElementById("qrScanModal") as HTMLDialogElement
    if (modal) modal.close()
  }
}
