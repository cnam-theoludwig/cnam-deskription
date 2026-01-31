import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ViewChild,
  ElementRef,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import {
  DoorOpen,
  House,
  Layers,
  Check,
  Trash2,
  Upload,
  LucideAngularModule,
  Armchair,
  QrCode,
} from "lucide-angular"

import type { OnChanges, SimpleChanges } from "@angular/core"
import type { Building } from "@repo/models/Building"
import type { Storey } from "@repo/models/Storey"
import type { Room } from "@repo/models/Room"
import type { FurnitureWithRelations } from "@repo/models/Furniture"
import { FurnitureAddFormComponent } from "../furnitures/furniture-add-form/furniture-add-form.component"
import { FurnitureService } from "../../services/furniture.service"
import { QrScanService } from "../../services/qr-scan.service"

@Component({
  selector: "app-control-panel",
  templateUrl: "./control-panel.component.html",
  styleUrls: ["./control-panel.component.css"],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    LucideAngularModule,
    FurnitureAddFormComponent,
  ],
})
export class ControlPanelComponent implements OnChanges {
  protected readonly HouseIcon = House
  protected readonly LayersIcon = Layers
  protected readonly DoorOpenIcon = DoorOpen
  protected readonly CheckIcon = Check
  protected readonly TrashIcon = Trash2
  protected readonly QrCodeIcon = QrCode
  protected readonly ArmchairIcon = Armchair
  protected readonly UploadIcon = Upload

  protected readonly furnitureService = inject(FurnitureService)
  protected readonly qrScanService = inject(QrScanService)

  @Input() public buildings!: Building[]
  @Input() public storeys!: Storey[]
  @Input() public rooms!: Room[]
  @Input() public furnitures!: FurnitureWithRelations[]

  @Input() public selectedBuilding?: Building
  @Input() public selectedStorey?: Storey
  @Input() public selectedRoom?: Room
  @Input() public selectedFurniture?: FurnitureWithRelations

  @Output() public selectBuilding = new EventEmitter<Building>()
  @Output() public addBuilding = new EventEmitter<void>()

  @Output() public selectStorey = new EventEmitter<Storey>()
  @Output() public addStorey = new EventEmitter<void>()
  @Output() public removeStorey = new EventEmitter<Storey>()

  @Input() public hideNotSelectedStoreys = false
  @Output() public toggleHideNotSelectedStoreys = new EventEmitter<boolean>()
  @Output() public selectRoom = new EventEmitter<Room>()
  @Output() public addRoom = new EventEmitter<void>()
  @Output() public removeRoom = new EventEmitter<Room>()
  @Output() public updateRoom = new EventEmitter<Room>()
  @Output() public floorPlanUploaded = new EventEmitter<{
    storeyId: string
    imageUrl: string
  }>()

  @ViewChild("fileInput") public fileInput!: ElementRef<HTMLInputElement>

  @Output() public selectFurniture = new EventEmitter<FurnitureWithRelations>()

  protected editRoomName: string = ""
  protected editRoomColor: string = ""

  protected editFurnitureName: string = ""

  // --- État Local ---
  protected currentStoreyForUpload: Storey | null = null

  public ngOnChanges(changes: SimpleChanges) {
    if (changes["selectedRoom"]) {
      const currentRoom = changes["selectedRoom"].currentValue
      if (currentRoom) {
        this.editRoomName = currentRoom.name
        this.editRoomColor = currentRoom.color
      }
    }

    if (changes["selectedFurniture"]) {
      const currentFurniture = changes["selectedFurniture"].currentValue
      if (currentFurniture) {
        this.editFurnitureName = currentFurniture.name
      }
    }
  }

  protected saveRoomEdit() {
    if (this.selectedRoom) {
      if (
        this.editRoomName !== this.selectedRoom.name ||
        this.editRoomColor !== this.selectedRoom.color
      ) {
        const updatedRoomPayload = {
          ...this.selectedRoom,
          name: this.editRoomName,
          color: this.editRoomColor,
        }
        this.updateRoom.emit(updatedRoomPayload)
      }
    }
  }

  protected triggerFloorPlanUpload(storey: Storey): void {
    this.currentStoreyForUpload = storey
    this.fileInput.nativeElement.click()
  }

  protected onFloorPlanSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0] && this.currentStoreyForUpload) {
      const file = input.files[0]
      const reader = new FileReader()

      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        if (this.currentStoreyForUpload) {
          this.floorPlanUploaded.emit({
            storeyId: this.currentStoreyForUpload.id,
            imageUrl,
          })
        }
      }

      reader.readAsDataURL(file)
      input.value = "" // Reset input
    }
  }

  protected onHideStoreysChange(event: Event): void {
    const target = event.target as HTMLInputElement
    this.toggleHideNotSelectedStoreys.emit(target.checked)
  }

  public selectAndUploadStoreyFloorPlan(storey: Storey) {
    this.triggerFloorPlanUpload(storey)
  }
}
