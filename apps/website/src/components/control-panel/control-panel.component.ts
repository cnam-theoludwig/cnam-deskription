import {
  Component,
  Input,
  Output,
  EventEmitter,
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
  Plus,
  Upload,
  LucideAngularModule,
} from "lucide-angular"

import type { OnChanges, SimpleChanges } from "@angular/core"
import type { Building } from "@repo/models/Building"
import type { Storey } from "@repo/models/Storey"
import type { Room } from "@repo/models/Room"

@Component({
  selector: "app-control-panel",
  templateUrl: "./control-panel.component.html",
  styleUrls: ["./control-panel.component.css"],
  standalone: true,
  imports: [FormsModule, CommonModule, LucideAngularModule],
})
export class ControlPanelComponent implements OnChanges {
  // --- Icones ---
  protected readonly HouseIcon = House
  protected readonly LayersIcon = Layers
  protected readonly DoorOpenIcon = DoorOpen
  protected readonly CheckIcon = Check
  protected readonly TrashIcon = Trash2
  protected readonly PlusIcon = Plus
  protected readonly UploadIcon = Upload

  // --- Inputs / Outputs ---
  @Input() public buildings: Building[] = []
  @Input() public storeys: Storey[] = []
  @Input() public rooms: Room[] = []

  @Input() public selectedBuilding: Building | undefined
  @Input() public selectedStorey: Storey | undefined
  @Input() public selectedRoom: Room | undefined

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

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>

  // --- État Local ---
  protected currentStoreyForUpload: Storey | null = null
  protected showAddRoom: boolean = false
  protected editName: string = ""
  protected editColor: string = ""

  public ngOnChanges(changes: SimpleChanges) {
    if (changes["selectedRoom"]) {
      const currentRoom = changes["selectedRoom"].currentValue
      if (currentRoom) {
        this.editName = currentRoom.name
        this.editColor = currentRoom.color
      }
    }
  }

  protected saveEdit() {
    if (this.selectedRoom) {
      if (
        this.editName !== this.selectedRoom.name ||
        this.editColor !== this.selectedRoom.color
      ) {
        const updatedRoomPayload = {
          ...this.selectedRoom,
          name: this.editName,
          color: this.editColor,
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
}
