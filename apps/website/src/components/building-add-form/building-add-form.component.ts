import { Component, inject, effect } from "@angular/core"
import type { OnInit } from "@angular/core"
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms"
import { RequiredComponent } from "../required/required.component"
import { BuildingService } from "../../services/building.service"
import type { BuildingCreate } from "@repo/models/Building"
import { firstValueFrom } from "rxjs"

import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"

@Component({
  selector: "app-building-add-form",
  imports: [
    ReactiveFormsModule,
    RequiredComponent,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: "./building-add-form.component.html",
  styleUrl: "./building-add-form.component.css",
})
export class BuildingAddFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder)
  protected readonly buildingService = inject(BuildingService)

  protected buildingForm!: FormGroup

  constructor() {
    effect(() => {
      const building = this.buildingService.buildingToEdit
      if (building) {
        this.buildingForm.patchValue({
          name: building.name,
        })
      } else {
        this.buildingForm?.reset({
          name: "",
        })
      }
    })
  }

  public ngOnInit() {
    this.buildingForm = this.fb.group({
      name: ["", Validators.required],
    })
  }

  public async onSubmit() {
    if (this.buildingForm.invalid) {
      alert("Veuillez remplir correctement tous les champs.")
      return
    }

    try {
      const buildingName = this.buildingForm.get("name")?.value
      const buildingToEdit = this.buildingService.buildingToEdit

      if (buildingToEdit) {
        await firstValueFrom(
          this.buildingService.update(buildingToEdit.id, {
            name: buildingName,
          }),
        )
      } else {
        const building: BuildingCreate = {
          name: buildingName,
        }
        await firstValueFrom(this.buildingService.create(building))
      }

      this.closeModal()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error)
      alert("Une erreur est survenue.")
    }
  }

  protected closeModal() {
    this.buildingService.closeModal()
  }
}
