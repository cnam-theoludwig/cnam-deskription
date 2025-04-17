import { AsyncPipe } from "@angular/common"
import { Component } from "@angular/core"
import { BasicService } from "../../services/basic.service"

@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: "./home-page.component.html",
  styleUrl: "./home-page.component.css",
})
export class HomePageComponent {
  public greeting$!: ReturnType<BasicService["getTodos"]>

  public constructor(private readonly basicService: BasicService) {
    this.greeting$ = this.basicService.getTodos()
  }
}
