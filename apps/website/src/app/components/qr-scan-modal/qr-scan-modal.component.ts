import { Component, inject, signal, output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { QrScannerComponent } from "../qr-scanner/qr-scanner.component"
import { FurnitureService } from "../../../services/furniture.service"
import { getRPCClient } from "@repo/api-client"
import type { FurnitureWithRelations } from "@repo/models/Furniture"

@Component({
  selector: "app-qr-scan-modal",
  standalone: true,
  imports: [CommonModule, QrScannerComponent],
  template: `
    <dialog
      id="qrScanModal"
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div class="modal-content">
        <h2>Scanner un QR Code</h2>

        @if (loading()) {
          <div class="loading-container">
            <div class="spinner"></div>
            <p>Récupération des informations du meuble...</p>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p class="error-message">{{ error() }}</p>
            <button class="btn-retry" type="button" (click)="resetError()">
              Réessayer
            </button>
          </div>
        } @else {
          <app-qr-scanner
            (scanSuccess)="onScanSuccess($event)"
            (scanError)="onScanError($event)"
          />
        }

        <div class="modal-actions flex justify-end gap-3 mt-6">
          <button
            class="bg-gray-300 text-gray-800 rounded px-4 py-2 transition duration-150 ease-in-out hover:bg-gray-200"
            type="button"
            (click)="closeModal()"
          >
            Fermer
          </button>
        </div>
      </div>
    </dialog>
  `,
  styles: [
    `
      dialog {
        border: none;
        padding: 0;
        border-radius: 12px;
        width: 700px;
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;
        box-sizing: border-box;
        background: #fff;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;
      }

      .modal-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
        flex: 1;
        min-height: 0;
      }

      dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
      }

      .modal-content h2 {
        margin: 0;
        font-size: 1.5rem;
        border-bottom: 1px solid #ddd;
        padding-bottom: 12px;
        color: #1e293b;
      }

      dialog:not([open]) {
        display: none;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3rem 2rem;
        gap: 1rem;
      }

      .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #e5e7eb;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .loading-container p {
        color: #64748b;
        font-size: 0.875rem;
      }

      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3rem 2rem;
        gap: 1rem;
      }

      .error-container svg {
        color: #ef4444;
      }

      .error-message {
        color: #991b1b;
        font-size: 0.875rem;
        text-align: center;
      }

      .btn-retry {
        padding: 0.5rem 1.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .btn-retry:hover {
        background-color: #2563eb;
      }
    `,
  ],
})
export class QrScanModalComponent {
  protected readonly furnitureService = inject(FurnitureService)

  protected loading = signal(false)
  protected error = signal<string | null>(null)

  // Événement émis quand un meuble est scanné avec succès pour navigation automatique
  public furnitureScanned = output<FurnitureWithRelations>()

  public openModal() {
    this.loading.set(false)
    this.error.set(null)
    const modal = document.getElementById("qrScanModal") as HTMLDialogElement

    if (!modal) return

    modal.addEventListener(
      "close",
      () => {
        this.loading.set(false)
        this.error.set(null)
      },
      { once: true },
    )
    modal.showModal()
  }

  public closeModal() {
    const modal = document.getElementById("qrScanModal") as HTMLDialogElement
    if (modal) modal.close()
  }

  protected async onScanSuccess(qrData: string): Promise<void> {
    this.loading.set(true)
    this.error.set(null)

    try {
      // Valider le format du QR code
      this.validateQrCode(qrData)

      const client = getRPCClient()
      const result = await client.qrcodes.scanFurniture({ qrData })

      // Émettre l'événement pour navigation automatique
      this.furnitureScanned.emit(result)

      this.closeModal()

      // Ouvrir la modale du meuble avec les données scannées
      setTimeout(() => {
        this.furnitureService.openModal(result)
      }, 100)
    } catch (error) {
      console.error("Error scanning QR code:", error)

      // Gestion des différents types d'erreurs
      let errorMessage = "Erreur lors du scan du QR code"

      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          errorMessage = "Ce meuble n'existe plus dans la base de données."
        } else if (error.message.includes("Format de QR code invalide")) {
          errorMessage = error.message
        } else if (error.message.includes("Type de QR code non supporté")) {
          errorMessage = error.message
        } else if (error.message.includes("identifiant manquant")) {
          errorMessage = error.message
        } else {
          errorMessage = error.message
        }
      }

      this.error.set(errorMessage)
    } finally {
      this.loading.set(false)
    }
  }

  protected onScanError(error: string): void {
    this.error.set(error)
  }

  protected resetError(): void {
    this.error.set(null)
  }

  private validateQrCode(qrData: string): { type: string; id: string } {
    let parsedData: { type: string; id: string }

    try {
      parsedData = JSON.parse(qrData) as { type: string; id: string }
    } catch {
      throw new Error(
        "Format de QR code invalide. Veuillez scanner un QR code valide.",
      )
    }

    if (parsedData.type !== "furniture") {
      throw new Error(
        `Type de QR code non supporté : "${parsedData.type}". Seuls les QR codes de meubles sont acceptés.`,
      )
    }

    if (!parsedData.id) {
      throw new Error("QR code invalide : identifiant manquant.")
    }

    return parsedData
  }
}
