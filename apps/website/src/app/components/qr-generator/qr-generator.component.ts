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

    const printWindow = window.open("", "_blank")
    if (printWindow === null || printWindow === undefined) {
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <title>Étiquette - ${this.furnitureName ?? `Meuble #${this.furnitureId}`}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #f5f5f5;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .label-container {
              background: white;
              border: 2px solid #333;
              border-radius: 12px;
              padding: 30px;
              width: 400px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .label-header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }

            .label-title {
              font-size: 28px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 10px;
              word-wrap: break-word;
            }

            .label-id {
              font-size: 14px;
              color: #64748b;
              font-family: 'Courier New', monospace;
              background: #f1f5f9;
              padding: 8px 12px;
              border-radius: 6px;
              display: inline-block;
            }

            .qr-section {
              display: flex;
              justify-content: center;
              margin: 25px 0;
            }

            .qr-wrapper {
              border: 3px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
              background: white;
            }

            img {
              display: block;
              width: 250px;
              height: 250px;
            }

            .label-footer {
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px solid #e2e8f0;
            }

            @media print {
              body {
                background: white;
              }

              .label-container {
                box-shadow: none;
                page-break-after: avoid;
              }

              @page {
                margin: 1cm;
                size: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="label-header">
              <div class="label-title">${this.furnitureName ?? `Meuble ${this.furnitureId}`}</div>
              <div class="label-id">ID: ${this.furnitureId}</div>
            </div>

            <div class="qr-section">
              <div class="qr-wrapper">
                <img src="${url}" alt="QR Code du meuble" />
              </div>
            </div>

            <div class="label-footer">
              Scanner ce code pour accéder aux informations du meuble
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
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

    // Dimensions de l'étiquette
    canvas.width = 600
    canvas.height = 800

    // Fond blanc
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Bordure
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

    // Titre
    ctx.fillStyle = "#1e293b"
    ctx.font = "bold 32px 'Segoe UI', Arial, sans-serif"
    ctx.textAlign = "center"
    const furnitureName = this.furnitureName ?? `Meuble ${this.furnitureId}`

    // Gérer le texte long en le divisant en lignes
    const maxWidth = canvas.width - 80
    const words = furnitureName.split(" ")
    let line = ""
    let y = 80

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " "
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, canvas.width / 2, y)
        line = words[i] + " "
        y += 40
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, canvas.width / 2, y)

    // ID du meuble
    y += 60
    ctx.fillStyle = "#64748b"
    ctx.font = "16px 'Courier New', monospace"
    ctx.fillText(`ID: ${this.furnitureId}`, canvas.width / 2, y)

    // Ligne de séparation
    y += 30
    ctx.strokeStyle = "#2563eb"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(50, y)
    ctx.lineTo(canvas.width - 50, y)
    ctx.stroke()

    // Charger et dessiner le QR code
    const img = new Image()
    img.onload = () => {
      const qrSize = 350
      const qrX = (canvas.width - qrSize) / 2
      const qrY = y + 40

      // Bordure du QR code
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 3
      ctx.strokeRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30)

      // QR code
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize)

      // Texte du pied de page
      ctx.fillStyle = "#94a3b8"
      ctx.font = "14px 'Segoe UI', Arial, sans-serif"
      ctx.fillText(
        "Scanner ce code pour accéder aux informations",
        canvas.width / 2,
        qrY + qrSize + 50
      )

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
