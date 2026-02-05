import { Component, inject, Input, effect } from "@angular/core"
import type { OnInit } from "@angular/core"
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms"
import { RequiredComponent } from "../required/required.component"
import { RoomService } from "../../services/room.service"
import type { RoomCreate } from "@repo/models/Room"
import type { Storey } from "@repo/models/Storey"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { ColorPickerModule } from "primeng/colorpicker"

@Component({
  selector: "app-room-add-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RequiredComponent,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ColorPickerModule,
  ],
  templateUrl: "./room-add-form.component.html",
  styleUrl: "./room-add-form.component.css",
})
export class RoomAddFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder)
  protected readonly roomService = inject(RoomService)

  @Input()
  public storeyId!: Storey["id"]

  protected roomForm!: FormGroup

  constructor() {
    effect(() => {
      const room = this.roomService.roomToEdit
      if (room) {
        this.roomForm.patchValue({
          name: room.name,
          color: room.color,
        })
      } else {
        this.roomForm?.reset({
          name: "",
          color: "#FFFFFF",
        })
      }
    })
  }

  public ngOnInit() {
    this.roomForm = this.fb.group({
      name: ["", Validators.required],
      color: ["#FFFFFF", Validators.required],
    })
  }

  public async onSubmit() {
    if (this.roomForm.invalid) {
      alert("Veuillez remplir correctement tous les champs.")
      return
    }

    try {
      const roomValues = {
        name: this.roomForm.get("name")?.value,
        color: this.roomForm.get("color")?.value,
      }

      const roomToEdit = this.roomService.roomToEdit
      if (roomToEdit) {
        await this.roomService.update(roomToEdit.id, roomValues)
      } else {
        const width = 4
        const depth = 4
        const position = this.findFreePosition(width, depth)

        const room: RoomCreate = {
          ...roomValues,
          storeyId: this.storeyId,
          x: position.x,
          z: position.z,
          width,
          depth,
        }
        await this.roomService.create(room)
      }

      this.closeModal()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error)
      alert("Une erreur est survenue.")
    }
  }

  protected closeModal() {
    this.roomService.closeModal()
  }

  private findFreePosition(
    width: number,
    depth: number,
  ): { x: number; z: number } {
    const rooms = this.roomService.rooms.filter(
      (r) => r.storeyId === this.storeyId,
    )
    const step = 1
    const maxRange = 20

    for (let r = 0; r <= maxRange; r += step) {
      for (let x = -r; x <= r; x += step) {
        for (let z = -r; z <= r; z += step) {
          if (Math.max(Math.abs(x), Math.abs(z)) !== r) continue

          const potentialRoom = { x, z, width, depth }
          let hasOverlap = false

          for (const room of rooms) {
            if (this.checkOverlap(potentialRoom, room)) {
              hasOverlap = true
              break
            }
          }

          if (!hasOverlap) {
            return { x, z }
          }
        }
      }
    }

    return { x: 0, z: 0 }
  }

  private checkOverlap(
    r1: { x: number; z: number; width: number; depth: number },
    r2: { x: number; z: number; width: number; depth: number },
  ): boolean {
    const r1hw = r1.width / 2
    const r1hd = r1.depth / 2
    const r2hw = r2.width / 2
    const r2hd = r2.depth / 2

    return (
      Math.abs(r1.x - r2.x) < r1hw + r2hw && Math.abs(r1.z - r2.z) < r1hd + r2hd
    )
  }
}
