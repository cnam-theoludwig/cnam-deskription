import { Component, ElementRef, inject, Input, ViewChild } from "@angular/core"
import * as THREE from "three"
import type {
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { Font, FontLoader } from "three/addons/loaders/FontLoader.js"
import { TextGeometry } from "three/addons/geometries/TextGeometry.js"
import type { Building } from "@repo/models/Building"
import { BuildingService } from "../../services/building.service"
import { StoreyService } from "../../services/storey.service"
import { CommonModule } from "@angular/common"
import type { Storey } from "@repo/models/Storey"

@Component({
  selector: "app-building-viewer-3d",
  imports: [CommonModule],
  templateUrl: "./building-viewer.component.html",
  styleUrls: ["./building-viewer.component.css"],
})
export class BuildingViewer3dComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild("canvasContainer", { static: true })
  protected canvasContainer!: ElementRef<HTMLDivElement>

  protected readonly buildingService = inject(BuildingService)
  protected readonly storeyService = inject(StoreyService)

  @Input() public building!: Building
  @Input() public storey!: Storey

  protected renderer!: THREE.WebGLRenderer
  protected scene!: THREE.Scene
  protected camera!: THREE.PerspectiveCamera
  protected controls!: OrbitControls
  protected animationId?: number
  protected raycaster = new THREE.Raycaster()
  protected mouse = new THREE.Vector2()
  protected font?: Font
  protected selectedFloorIndex = 0
  protected cameraTarget = new THREE.Vector3()
  protected cameraPosTarget = new THREE.Vector3()
  protected cameraLerpSpeed = 0.05
  protected isAnimatingToFloor = false

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["building"] != null && !changes["building"].firstChange) {
      this.refreshBuilding()
    }
    if (changes["storey"] != null && this.scene != null) {
      this.selectedFloorIndex = this.storeyService.storeys.indexOf(this.storey)
      this.refreshBuilding()
      this.highlightSelectedFloor()
    }
  }

  protected refreshBuilding(): void {
    this.scene.children = this.scene.children.filter((c) => {
      return !(c instanceof THREE.Group)
    })
    this.storeyService.getByBuildingId(this.building.id).subscribe(() => {
      this.renderBuilding()
    })
  }

  public ngAfterViewInit(): void {
    this.initScene()
    void this.loadFont().then(() => {
      this.renderBuilding()
      this.animate()
    })
  }

  public ngOnDestroy(): void {
    if (this.animationId !== undefined && this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
    }
    this.renderer.dispose()
  }

  protected highlightSelectedFloor(): void {
    console.log("Highlighting floor index:", this.selectedFloorIndex)
    this.scene.traverse((obj) => {
      if (
        obj instanceof THREE.Mesh &&
        obj.material instanceof THREE.MeshStandardMaterial &&
        obj.parent instanceof THREE.Group &&
        obj.parent.userData.floorIndex != null
      ) {
        const groupIndex = obj.parent.userData.floorIndex
        if (obj.geometry instanceof THREE.BoxGeometry) {
          obj.material.color.set(
            groupIndex === this.selectedFloorIndex ? "#e0f2fe" : "#f0f0f0",
          )
        } else if (obj.geometry instanceof TextGeometry) {
          obj.material.color.set(
            groupIndex === this.selectedFloorIndex ? "#0ea5e9" : "#64748b",
          )
        }
      }
    })

    const floorSpacing = 5
    const target = new THREE.Vector3(
      0,
      this.selectedFloorIndex * floorSpacing,
      0,
    )
    const offset = new THREE.Vector3(25, 10, 25)
    this.cameraTarget.copy(target)
    this.cameraPosTarget.copy(target.clone().add(offset))
    this.isAnimatingToFloor = true
  }

  protected initScene(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(
      this.canvasContainer.nativeElement.clientWidth,
      this.canvasContainer.nativeElement.clientHeight,
    )
    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement)

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color("#e2e8f0")

    this.camera = new THREE.PerspectiveCamera(
      50,
      this.canvasContainer.nativeElement.clientWidth /
        this.canvasContainer.nativeElement.clientHeight,
      0.1,
      1000,
    )
    this.camera.position.set(25, 15, 25)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.minDistance = 10
    this.controls.maxDistance = 80
    this.controls.minPolarAngle = 0
    this.controls.maxPolarAngle = Math.PI
    this.controls.addEventListener("start", () => {
      this.isAnimatingToFloor = false
    })

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(20, 20, 20)
    this.scene.add(dirLight)

    const grid = new THREE.GridHelper(30, 30, "#cbd5e1", "#e2e8f0")
    grid.position.set(0, -0.1, 0)
    this.scene.add(grid)
  }

  protected async loadFont(): Promise<void> {
    return new Promise((resolve, reject) => {
      const loader = new FontLoader()
      loader.load(
        "https://threejs.org/examples/fonts/gentilis_regular.typeface.json",
        (font: Font) => {
          this.font = font
          resolve()
        },
        undefined,
        (error) => {
          reject(new Error(String(error)))
        },
      )
    })
  }

  protected renderBuilding(): void {
    for (let index = 0; index < this.storeyService.storeys.length; index++) {
      this.renderFloor(this.storeyService.storeys[index] as Storey, index)
    }
  }

  protected renderFloor(floor: Storey, index: number): void {
    const floorWidth = 20
    const floorLength = 15
    const floorThickness = 0.2
    const floorSpacing = 5
    const y = index * floorSpacing
    const group = new THREE.Group()
    group.position.set(0, y, 0)
    group.userData.floorIndex = index

    const slabGeom = new THREE.BoxGeometry(
      floorWidth,
      floorThickness,
      floorLength,
    )
    const slabMat = new THREE.MeshStandardMaterial({
      color: index === this.selectedFloorIndex ? "#e0f2fe" : "#f0f0f0",
      transparent: true,
      opacity: 0.8,
    })
    const slab = new THREE.Mesh(slabGeom, slabMat)
    group.add(slab)

    if (this.font != null) {
      const textGeom = new TextGeometry(floor.name, {
        font: this.font,
        size: 0.5,
        depth: 0.05,
      })
      const textMat = new THREE.MeshStandardMaterial({
        color: index === this.selectedFloorIndex ? "#0ea5e9" : "#64748b",
      })
      const textMesh = new THREE.Mesh(textGeom, textMat)
      textMesh.position.set(0, floorThickness + 0.5, floorThickness / 2 + 1)
      group.add(textMesh)
    }

    this.scene.add(group)
  }

  protected animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate)

    if (this.isAnimatingToFloor) {
      const posDiff = this.cameraPosTarget
        .clone()
        .sub(this.camera.position)
        .length()
      const targetDiff = this.cameraTarget
        .clone()
        .sub(this.controls.target)
        .length()

      if (posDiff > 0.01) {
        this.camera.position.lerp(this.cameraPosTarget, this.cameraLerpSpeed)
      }
      if (targetDiff > 0.01) {
        this.controls.target.lerp(this.cameraTarget, this.cameraLerpSpeed)
      }

      if (posDiff <= 0.01 && targetDiff <= 0.01) {
        this.isAnimatingToFloor = false
      }
    }

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}
