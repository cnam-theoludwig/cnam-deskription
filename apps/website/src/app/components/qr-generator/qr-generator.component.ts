import { Component, Input, signal, effect } from "@angular/core"
import { CommonModule } from "@angular/common"
import { getRPCClient } from "@repo/api-client"

@Component({
  selector: "app-qr-generator",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./qr-generator.component.html",
  styleUrls: ["./qr-generator.component.css"],
})
export class QrGeneratorComponent {
  @Input({ required: true }) public furnitureId!: string
  @Input() public furnitureName?: string

  public qrCodeUrl = signal<string | null>(null)
  public loading = signal(false)
  public error = signal<string | null>(null)

  public constructor() {
    effect(() => {
      if (this.furnitureId !== null && this.furnitureId !== undefined && this.furnitureId !== "") {
        void this.generateQRCode()
      }
    })
  }

  public async generateQRCode(): Promise<void> {
    this.loading.set(true)
    this.error.set(null)

    try {
      const client = getRPCClient()
      const result = await client.qrcodes.generateForFurniture({
        furnitureId: this.furnitureId,
      })

      this.qrCodeUrl.set(result.qrCodeDataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
      this.error.set(
        error instanceof Error ? error.message : "Erreur lors de la génération du QR code"
      )
    } finally {
      this.loading.set(false)
    }
  }

  public downloadQRCode(): void {
    const url = this.qrCodeUrl()
    if (url === null || url === undefined) {
      return
    }

    const link = document.createElement("a")
    link.href = url
    link.download = `qrcode-furniture-${this.furnitureId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  public printQRCode(): void {
    const url = this.qrCodeUrl()
    if (url === null || url === undefined) {
      return
    }

    // Créer un élément d'impression temporaire dans la page courante
    const printElement = document.createElement("div")
    printElement.id = "print-label-temp"
    printElement.innerHTML = `
      <div class="label-container">
        <div class="qr-section">
          <div class="qr-wrapper">
            <img src="${url}" alt="QR Code du meuble" />
          </div>
        </div>
        <div class="info-section">
          <div class="label-id">ID: ${this.furnitureId}</div>
          <div class="label-title">${this.furnitureName ?? `Meuble ${this.furnitureId}`}</div>
        </div>
      </div>
    `

    // Ajouter les styles pour l'impression
    const printStyle = document.createElement("style")
    printStyle.id = "print-label-style"
    printStyle.textContent = `
      @media print {
        * {
          margin: 0 !important;
          padding: 0 !important;
        }

        body * {
          visibility: hidden;
        }

        #print-label-temp,
        #print-label-temp * {
          visibility: visible;
        }

        #print-label-temp {
          position: fixed;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          page-break-after: avoid;
        }

        #print-label-temp .label-container {
          background: white;
          border: 3px solid #333;
          border-radius: 8px;
          padding: 12mm 15mm;
          width: 200mm;
          height: 80mm;
          display: flex;
          align-items: center;
          gap: 15mm;
          box-sizing: border-box;
          page-break-inside: avoid;
        }

        #print-label-temp .qr-section {
          flex-shrink: 0;
        }

        #print-label-temp .qr-wrapper {
          border: 3px solid #e2e8f0;
          border-radius: 6px;
          padding: 5mm;
          background: white;
        }

        #print-label-temp img {
          display: block;
          width: 60mm;
          height: 60mm;
        }

        #print-label-temp .info-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8mm;
          min-width: 0;
        }

        #print-label-temp .label-id {
          font-size: 14pt;
          color: #1e293b;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          background: #f1f5f9;
          padding: 4mm 5mm;
          border-radius: 3mm;
          border-left: 4px solid #2563eb;
          word-break: break-all;
          line-height: 1.4;
        }

        #print-label-temp .label-title {
          font-size: 20pt;
          font-weight: bold;
          color: #1e293b;
          word-wrap: break-word;
          line-height: 1.3;
        }

        @page {
          size: 200mm 80mm;
          margin: 0;
        }

        html, body {
          height: 80mm;
          overflow: hidden;
        }
      }

      @media screen {
        #print-label-temp {
          display: none;
        }
      }
    `

    document.body.appendChild(printStyle)
    document.body.appendChild(printElement)

    // Variable pour éviter l'impression double
    let printExecuted = false

    const executePrint = () => {
      if (printExecuted) return
      printExecuted = true

      setTimeout(() => {
        window.print()
        // Nettoyer après l'impression
        setTimeout(() => {
          if (document.body.contains(printElement)) {
            document.body.removeChild(printElement)
          }
          if (document.body.contains(printStyle)) {
            document.body.removeChild(printStyle)
          }
        }, 1000)
      }, 200)
    }

    // Attendre que l'image soit chargée puis imprimer
    const img = printElement.querySelector("img")
    if (img) {
      if (img.complete) {
        // Image déjà en cache
        executePrint()
      } else {
        // Attendre le chargement
        img.onload = executePrint
        img.onerror = () => {
          console.error("Erreur de chargement de l'image")
          if (document.body.contains(printElement)) {
            document.body.removeChild(printElement)
          }
          if (document.body.contains(printStyle)) {
            document.body.removeChild(printStyle)
          }
        }
      }
    }
  }

  public downloadLabel(): void {
    const url = this.qrCodeUrl()
    if (url === null || url === undefined) {
      return
    }

    // Créer un canvas pour générer l'étiquette
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (ctx === null || ctx === undefined) {
      return
    }

    // Dimensions de l'étiquette (format paysage 200mm x 80mm à 300 DPI)
    // 200mm ≈ 2362px, 80mm ≈ 945px à 300 DPI
    canvas.width = 1600
    canvas.height = 640

    // Fond blanc
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Bordure
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 8
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

    // Padding interne
    const paddingX = 100
    const paddingY = 80

    // Charger et dessiner le QR code
    const img = new Image()
    img.onload = () => {
      const qrSize = 480
      const qrX = paddingX
      const qrY = paddingY

      // Bordure du QR code
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 6
      ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32)

      // QR code
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize)

      // Section des informations (à droite du QR code)
      const infoX = qrX + qrSize + 100
      let infoY = 170

      // ID du meuble
      ctx.fillStyle = "#f1f5f9"
      const idBoxX = infoX
      const idBoxY = infoY - 50
      const idBoxWidth = canvas.width - infoX - paddingX
      const idBoxHeight = 85
      ctx.fillRect(idBoxX, idBoxY, idBoxWidth, idBoxHeight)

      // Bordure gauche bleue pour l'ID
      ctx.fillStyle = "#2563eb"
      ctx.fillRect(idBoxX, idBoxY, 8, idBoxHeight)

      // Texte ID
      ctx.fillStyle = "#1e293b"
      ctx.font = "bold 32px 'Courier New', monospace"
      ctx.textAlign = "left"
      ctx.fillText(`ID: ${this.furnitureId}`, idBoxX + 30, infoY)

      // Nom du meuble (en dessous de l'ID)
      infoY += 115
      ctx.fillStyle = "#1e293b"
      ctx.font = "bold 48px 'Segoe UI', Arial, sans-serif"
      const furnitureName = this.furnitureName ?? `Meuble ${this.furnitureId}`

      // Gérer le texte long en le divisant en lignes
      const maxWidth = canvas.width - infoX - paddingX
      const words = furnitureName.split(" ")
      let line = ""
      const lineHeight = 60

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " "
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, infoX, infoY)
          line = words[i] + " "
          infoY += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, infoX, infoY)

      // Télécharger l'image
      canvas.toBlob((blob) => {
        if (blob === null) {
          return
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `etiquette-${this.furnitureId}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })
    }
    img.src = url
  }
}
