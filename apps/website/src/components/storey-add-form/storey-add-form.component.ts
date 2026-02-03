import { Component, inject, Input } from "@angular/core"
import type { OnInit } from "@angular/core"
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms"
import { RequiredComponent } from "../required/required.component"
import type { Building } from "@repo/models/Building"
import { firstValueFrom } from "rxjs"
import type { StoreyCreate } from "@repo/models/Storey"
import { StoreyService } from "../../services/storey.service"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"

@Component({
  selector: "app-storey-add-form",
  imports: [
    ReactiveFormsModule,
    RequiredComponent,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: "./storey-add-form.component.html",
  styleUrl: "./storey-add-form.component.css",
})
export class StoreyAddFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder)
  protected readonly storeyService = inject(StoreyService)

  @Input()
  public buildingId!: Building["id"]

  protected storeyForm!: FormGroup

  public ngOnInit() {
    this.storeyForm = this.fb.group({
      name: ["", Validators.required],
    })
  }

  public async onSubmit() {
    if (this.storeyForm.invalid) {
      alert("Veuillez remplir correctement tous les champs.")
      return
    }

    try {
      const storey: StoreyCreate = {
        name: this.storeyForm.get("name")?.value,
        buildingId: this.buildingId,
      }

      await firstValueFrom(this.storeyService.create(storey))

      this.closeModal()
    } catch (error) {
      console.error("Erreur lors de la création :", error)
      alert("Une erreur est survenue.")
    }
  }

  protected closeModal() {
    this.storeyForm = this.fb.group({
      name: ["", Validators.required],
    })
    const modal = document.getElementById("addStoreyModal") as HTMLDialogElement
    modal.close()
  }
}
