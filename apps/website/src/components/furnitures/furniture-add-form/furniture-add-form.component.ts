import { Component } from "@angular/core"
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms"
import { FurnitureService } from "../../../services/furniture.service"
import type { FurnitureCreate } from "@repo/models/Furniture"

@Component({
  selector: "app-furniture-add-form",
  imports: [ReactiveFormsModule],
  templateUrl: "./furniture-add-form.component.html",
  styleUrl: "./furniture-add-form.component.css",
})
export class FurnitureAddFormComponent {
  public furnitureForm = new FormGroup({
    description: new FormControl(""),
  })

  public constructor(private readonly furnitureService: FurnitureService) {}

  public onSubmit() {
    console.log(this.furnitureForm.value)
    const data = this.furnitureForm.value as FurnitureCreate
    this.furnitureService.create(data).subscribe({
      next: (response) => {
        console.log("Furniture added successfully:", response)
        this.furnitureForm.reset()
      },
      error: (error) => {
        console.error("Error adding furniture:", error)
      },
    })
  }
}
