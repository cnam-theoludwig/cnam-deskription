import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import type { Building } from "@repo/models/Building"
import type { Storey } from "@repo/models/Storey"
import { House, Layers, LucideAngularModule } from "lucide-angular"

@Component({
  selector: "app-control-panel",
  templateUrl: "./control-panel.component.html",
  imports: [FormsModule, CommonModule, LucideAngularModule],
  styleUrls: ["./control-panel.component.css"],
})
export class ControlPanelComponent {
  protected readonly HouseIcon = House
  protected readonly LayersIcon = Layers

  @Input() public buildings!: Building[]
  @Input() public storeys!: Storey[]

  @Input() public selectedBuilding!: Building
  @Input() public selectedStorey!: Storey

  @Output() public selectBuilding = new EventEmitter<Building>()
  @Output() public addBuilding = new EventEmitter<void>()

  @Output() public selectStorey = new EventEmitter<Storey>()
  @Output() public addStorey = new EventEmitter<void>()
  @Output() public removeStorey = new EventEmitter<Storey>()
}
