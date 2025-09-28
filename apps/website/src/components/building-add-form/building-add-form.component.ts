import { Component, inject } from "@angular/core"
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

@Component({
  selector: "app-building-add-form",
  imports: [ReactiveFormsModule, RequiredComponent],
  templateUrl: "./building-add-form.component.html",
  styleUrl: "./building-add-form.component.css",
})
export class BuildingAddFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder)
  protected readonly buildingService = inject(BuildingService)

  protected buildingForm!: FormGroup

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
      const building: BuildingCreate = {
        name: this.buildingForm.get("name")?.value,
      }

      await firstValueFrom(this.buildingService.create(building))

      this.closeModal()
    } catch (error) {
      console.error("Erreur lors de la création :", error)
      alert("Une erreur est survenue.")
    }
  }

  protected closeModal() {
    this.buildingForm = this.fb.group({
      name: ["", Validators.required],
    })
    const modal = document.getElementById(
      "addBuildingModal",
    ) as HTMLDialogElement
    modal.close()
  }
}
