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
import type { MenuItem } from "primeng/api"
import { SelectModule } from "primeng/select"
import { CheckboxModule } from "primeng/checkbox"
import { ButtonModule } from "primeng/button"
import { SpeedDialModule } from "primeng/speeddial"
import { ColorPickerModule } from "primeng/colorpicker"
import { InputTextModule } from "primeng/inputtext"

import type { OnChanges, OnInit, SimpleChanges } from "@angular/core"
import type { Building } from "@repo/models/Building"
import type { Storey } from "@repo/models/Storey"
import type { Room } from "@repo/models/Room"
import type { FurnitureWithRelations } from "@repo/models/Furniture"
import { FurnitureAddFormComponent } from "../furnitures/furniture-add-form/furniture-add-form.component"
import { FurnitureService } from "../../services/furniture.service"
import { RoomService } from "../../services/room.service"
import { BuildingService } from "../../services/building.service"
import { StoreyService } from "../../services/storey.service"
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
    SelectModule,
    CheckboxModule,
    ButtonModule,
    SpeedDialModule,
    ColorPickerModule,
    InputTextModule,
  ],
})
export class ControlPanelComponent implements OnChanges, OnInit {
  protected readonly HouseIcon = House
  protected readonly LayersIcon = Layers
  protected readonly DoorOpenIcon = DoorOpen
  protected readonly CheckIcon = Check
  protected readonly TrashIcon = Trash2
  protected readonly QrCodeIcon = QrCode
  protected readonly ArmchairIcon = Armchair
  protected readonly UploadIcon = Upload

  protected readonly furnitureService = inject(FurnitureService)
  protected readonly roomService = inject(RoomService)
  public readonly buildingService = inject(BuildingService)
  public readonly storeyService = inject(StoreyService)
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
  @Output() public removeBuilding = new EventEmitter<Building>()

  @Output() public selectStorey = new EventEmitter<Storey>()
  @Output() public addStorey = new EventEmitter<void>()
  @Output() public removeStorey = new EventEmitter<Storey>()

  @Input() public hideNotSelectedStoreys = false
  @Output() public toggleHideNotSelectedStoreys = new EventEmitter<boolean>()

  @Input() public showAllStoreyFurnitures = false
  @Output() public toggleShowAllStoreyFurnitures = new EventEmitter<boolean>()
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
  @Output() public removeFurniture = new EventEmitter<FurnitureWithRelations>()

  protected editRoomName: string = ""
  protected editRoomColor: string = ""

  protected editFurnitureName: string = ""

  protected roomFurnitures: FurnitureWithRelations[] = []
  protected showFurnitureInput = false
  protected newFurnitureName = ""
  protected selectedModelType = "chair"

  protected currentStoreyForUpload: Storey | null = null

  protected buildingItems: MenuItem[] = []
  protected storeyItems: MenuItem[] = []
  protected roomItems: MenuItem[] = []
  protected furnitureItems: MenuItem[] = []

  public ngOnInit() {
    this.updateMenus()
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.updateMenus()
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
      input.value = ""
    }
  }

  private renameBuilding() {
    if (!this.selectedBuilding) return
    this.buildingService.openModal(this.selectedBuilding.id)
  }

  private renameStorey() {
    if (!this.selectedStorey) return
    this.storeyService.openModal(this.selectedStorey.id)
  }

  private updateMenus() {
    this.buildingItems = [
      {
        icon: "pi pi-plus",
        tooltipOptions: { tooltipLabel: "Ajouter un bâtiment" },
        command: () => this.addBuilding.emit(),
      },
      {
        icon: "pi pi-pencil",
        visible: !!this.selectedBuilding,
        tooltipOptions: { tooltipLabel: "Modifier le bâtiment" },
        command: () => this.renameBuilding(),
      },
      {
        icon: "pi pi-trash",
        visible: !!this.selectedBuilding,
        tooltipOptions: { tooltipLabel: "Supprimer le bâtiment" },
        command: () =>
          this.selectedBuilding &&
          this.removeBuilding.emit(this.selectedBuilding),
      },
    ]

    this.storeyItems = [
      {
        icon: "pi pi-plus",
        tooltipOptions: { tooltipLabel: "Ajouter un étage" },
        command: () => this.addStorey.emit(),
      },
      {
        icon: "pi pi-pencil",
        visible: !!this.selectedStorey,
        tooltipOptions: { tooltipLabel: "Modifier l'étage" },
        command: () => this.renameStorey(),
      },
      {
        icon: "pi pi-upload",
        visible: !!this.selectedStorey,
        tooltipOptions: { tooltipLabel: "Plan 2D" },
        command: () =>
          this.selectedStorey &&
          this.triggerFloorPlanUpload(this.selectedStorey),
      },
      {
        icon: "pi pi-trash",
        visible: !!this.selectedStorey,
        tooltipOptions: { tooltipLabel: "Supprimer l'étage" },
        command: () =>
          this.selectedStorey && this.removeStorey.emit(this.selectedStorey),
      },
    ]

    this.roomItems = [
      {
        icon: "pi pi-plus",
        tooltipOptions: { tooltipLabel: "Ajouter une pièce" },
        command: () => this.addRoom.emit(),
      },
      {
        icon: "pi pi-pencil",
        visible: !!this.selectedRoom,
        tooltipOptions: { tooltipLabel: "Modifier la pièce" },
        command: () =>
          this.selectedRoom && this.roomService.openModal(this.selectedRoom.id),
      },
      {
        icon: "pi pi-trash",
        visible: !!this.selectedRoom,
        tooltipOptions: { tooltipLabel: "Supprimer la pièce" },
        command: () =>
          this.selectedRoom && this.removeRoom.emit(this.selectedRoom),
      },
    ]

    this.furnitureItems = [
      {
        icon: "pi pi-plus",
        tooltipOptions: { tooltipLabel: "Ajouter un meuble" },
        command: () => {
          this.furnitureService.openModal()
          const modal = document.getElementById(
            "addFurnitureModal",
          ) as HTMLDialogElement
          if (modal) modal.showModal()
        },
      },
      {
        icon: "pi pi-pencil",
        visible: !!this.selectedFurniture,
        tooltipOptions: { tooltipLabel: "Modifier le meuble" },
        command: () =>
          this.selectedFurniture &&
          this.furnitureService.openModal(this.selectedFurniture.id),
      },
      {
        icon: "pi pi-trash",
        visible: !!this.selectedFurniture,
        tooltipOptions: { tooltipLabel: "Supprimer le meuble" },
        command: () =>
          this.selectedFurniture &&
          this.removeFurniture.emit(this.selectedFurniture),
      },
    ]
  }

  protected onHideStoreysChange(event: Event): void {
    const target = event.target as HTMLInputElement
    this.toggleHideNotSelectedStoreys.emit(target.checked)
  }

  public selectAndUploadStoreyFloorPlan(storey: Storey) {
    this.triggerFloorPlanUpload(storey)
  }
}
