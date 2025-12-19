import { Component, Input, Output, EventEmitter, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import {
  DoorOpen,
  House,
  Layers,
  Check,
  Trash2,
  Plus,
  LucideAngularModule,
  Armchair,
} from "lucide-angular"

import type { OnChanges, SimpleChanges } from "@angular/core"
import type { Building } from "@repo/models/Building"
import type { Storey } from "@repo/models/Storey"
import type { Room } from "@repo/models/Room"
import type { FurnitureWithRelations } from "@repo/models/Furniture"
import { FurnitureAddFormComponent } from "../furnitures/furniture-add-form/furniture-add-form.component"
import { FurnitureService } from "../../services/furniture.service"

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
  protected readonly PlusIcon = Plus
  protected readonly ArmchairIcon = Armchair

  protected readonly furnitureService = inject(FurnitureService)

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

  @Output() public selectRoom = new EventEmitter<Room>()
  @Output() public addRoom = new EventEmitter<void>()
  @Output() public removeRoom = new EventEmitter<Room>()
  @Output() public updateRoom = new EventEmitter<Room>()

  @Output() public selectFurniture = new EventEmitter<FurnitureWithRelations>()

  protected editRoomName: string = ""
  protected editRoomColor: string = ""

  protected editFurnitureName: string = ""

  protected roomFurnitures: FurnitureWithRelations[] = []
  protected showFurnitureInput = false
  protected newFurnitureName = ""
  protected selectedModelType = "chair"

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
}
