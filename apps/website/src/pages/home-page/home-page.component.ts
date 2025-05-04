import { Component } from "@angular/core"
import { FurnitureService } from "../../services/furniture.service"
import { FurnitureAddFormComponent } from "../../components/furnitures/furniture-add-form/furniture-add-form.component"

@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [FurnitureAddFormComponent],
  templateUrl: "./home-page.component.html",
  styleUrl: "./home-page.component.css",
})
export class HomePageComponent {
  public constructor(private readonly furnitureService: FurnitureService) {
    this.furnitureService.get()
  }

  public get furnitures(): FurnitureService["furnitures"] {
    return this.furnitureService.furnitures
  }

  public get furnituresStatus(): FurnitureService["furnituresStatus"] {
    return this.furnitureService.furnituresStatus
  }
}
