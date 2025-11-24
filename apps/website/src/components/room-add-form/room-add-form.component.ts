import { Component, inject, Input } from "@angular/core"
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

@Component({
  selector: "app-room-add-form",
  standalone: true,
  imports: [ReactiveFormsModule, RequiredComponent, FormsModule],
  templateUrl: "./room-add-form.component.html",
  styleUrl: "./room-add-form.component.css",
})
export class RoomAddFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder)
  protected readonly roomService = inject(RoomService)

  @Input()
  public storeyId!: Storey["id"]

  protected roomForm!: FormGroup

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
      const room: RoomCreate = {
        name: this.roomForm.get("name")?.value,
        storeyId: this.storeyId,
        color: this.roomForm.get("color")?.value,
      }

      await this.roomService.create(room)

      this.closeModal()
    } catch (error) {
      console.error("Erreur lors de la création :", error)
      alert("Une erreur est survenue.")
    }
  }

  protected closeModal() {
    this.roomForm = this.fb.group({
      name: ["", Validators.required],
      color: ["#FFFFFF", Validators.required],
    })
    const modal = document.getElementById("addRoomModal") as HTMLDialogElement
    modal.close()
  }
}
