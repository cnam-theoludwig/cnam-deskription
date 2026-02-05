import type { OnInit, OnDestroy } from "@angular/core"
import {
  Component,
  ViewChild,
  ElementRef,
  signal,
  output,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library"

@Component({
  selector: "app-qr-scanner",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./qr-scanner.component.html",
  styleUrls: ["./qr-scanner.component.css"],
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @ViewChild("video", { static: false }) public videoElement!: ElementRef<HTMLVideoElement>

  public codeReader = new BrowserMultiFormatReader()
  public scanning = signal(false)
  public error = signal<string | null>(null)
  public hasCamera = signal(true)

  // Événements
  public scanSuccess = output<string>()
  public scanError = output<string>()

  public ngOnInit(): void {
    void this.checkCameraAvailability()
  }

  public ngOnDestroy(): void {
    this.stopScanning()
  }

  public async checkCameraAvailability(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => {
        return device.kind === "videoinput"
      })
      this.hasCamera.set(videoDevices.length > 0)
    } catch (error) {
      console.error("Error checking camera availability:", error)
      this.hasCamera.set(false)
      this.error.set("Impossible d'accéder à la caméra")
    }
  }

  public async startScanning(): Promise<void> {
    if (!this.hasCamera()) {
      this.error.set("Aucune caméra détectée")
      return
    }

    try {
      this.error.set(null)
      this.scanning.set(true)

      const videoInputDevices = await this.codeReader.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        this.error.set("Aucune caméra disponible")
        this.scanning.set(false)
        return
      }

      // Utiliser la première caméra disponible
      const firstDevice = videoInputDevices[0]
      if (firstDevice === null || firstDevice === undefined) {
        this.error.set("Aucune caméra disponible")
        this.scanning.set(false)
        return
      }

      const selectedDeviceId = firstDevice.deviceId

      void this.codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        this.videoElement.nativeElement,
        (result, error) => {
          if (result !== null && result !== undefined) {
            this.scanSuccess.emit(result.getText())
            this.stopScanning()
          }
          if (error !== null && error !== undefined && !(error instanceof NotFoundException)) {
            console.error("Scan error:", error)
          }
        }
      )
    } catch (error) {
      console.error("Error starting scanner:", error)
      this.error.set(
        error instanceof Error ? error.message : "Erreur lors du démarrage du scanner"
      )
      this.scanning.set(false)
      this.scanError.emit(this.error() ?? "Unknown error")
    }
  }

  public stopScanning(): void {
    this.codeReader.reset()
    this.scanning.set(false)
  }

  public toggleScanning(): void {
    if (this.scanning()) {
      this.stopScanning()
    } else {
      void this.startScanning()
    }
  }
}
