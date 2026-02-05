import { Component, inject, Input, effect } from "@angular/core"
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

  constructor() {
    effect(() => {
      const storey = this.storeyService.storeyToEdit
      if (storey) {
        this.storeyForm.patchValue({
          name: storey.name,
        })
      } else {
        this.storeyForm?.reset({
          name: "",
        })
      }
    })
  }

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
      const storeyName = this.storeyForm.get("name")?.value
      const storeyToEdit = this.storeyService.storeyToEdit

      if (storeyToEdit) {
        await firstValueFrom(
          this.storeyService.update(storeyToEdit.id, { name: storeyName }),
        )
      } else {
        const storey: StoreyCreate = {
          name: storeyName,
          buildingId: this.buildingId,
        }
        await firstValueFrom(this.storeyService.create(storey))
      }

      this.closeModal()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error)
      alert("Une erreur est survenue.")
    }
  }

  protected closeModal() {
    this.storeyService.closeModal()
  }
}
