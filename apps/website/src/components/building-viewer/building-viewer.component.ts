import {
  Component,
  ElementRef,
  inject,
  Input,
  Output,
  ViewChild,
  EventEmitter,
} from "@angular/core"
import type {
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { Font, FontLoader } from "three/addons/loaders/FontLoader.js"
import { TextGeometry } from "three/addons/geometries/TextGeometry.js"

import type { Building } from "@repo/models/Building"
import type { Storey } from "@repo/models/Storey"
import type { Room } from "@repo/models/Room"
import { BuildingService } from "../../services/building.service"
import { StoreyService } from "../../services/storey.service"
import { RoomService } from "../../services/room.service"

@Component({
  selector: "app-building-viewer-3d",
  standalone: true,
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
  protected readonly roomService = inject(RoomService)
  protected mouse = new THREE.Vector2()

  @Input() public selectedBuilding!: Building
  @Input() public selectedStorey!: Storey
  @Input() public selectedRoom!: Room
  @Input() public storeys!: Storey[]
  @Input() public rooms!: Room[]
  @Input() public storeyFloorPlans?: Map<string, string>

  // --- ThreeJS Core ---
  @Input() public hideNotSelectedStoreys: boolean = false

  @Output() public storeySelected = new EventEmitter<Storey>()

  protected renderer!: THREE.WebGLRenderer
  protected scene!: THREE.Scene
  protected camera!: THREE.PerspectiveCamera
  protected controls!: OrbitControls
  protected raycaster = new THREE.Raycaster()
  protected animationId?: number
  protected font?: Font

  // --- Configuration ---
  private readonly FLOOR_SPACING = 7
  private readonly FLOOR_WIDTH = 20
  private readonly FLOOR_LENGTH = 15
  private readonly FLOOR_THICKNESS = 0.2
  private readonly SCALE = 0.05
  private readonly ROOM_THICKNESS = 0.05
  private readonly FLOOR_PLAN_OPACITY = 0.9

  // --- État de l'interface ---
  protected selectedFloorIndex = 0
  protected cameraTarget = new THREE.Vector3()
  protected cameraPosTarget = new THREE.Vector3()
  protected isAnimatingToFloor = false

  // --- État Drag & Drop / Resize ---
  protected interactionState: "IDLE" | "DRAGGING" | "RESIZING" = "IDLE"

  protected activeRoom: Room | null = null
  protected activeHandle: string | null = null

  // Gestion du "Fantôme" (Preview)
  protected ghostMesh: THREE.Mesh | null = null
  protected originalMeshHidden: THREE.Object3D | null = null

  // Données temporaires du fantôme (en unités BDD)
  protected ghostData: { x: number; z: number; w: number; d: number } | null =
    null

  protected startData?: {
    roomX: number
    roomZ: number
    roomW: number
    roomD: number
    mouseX: number
    mouseZ: number
  }

  // --- Lifecycles ---
  protected isOrbiting = false

  public ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["selectedBuilding"] !== undefined &&
      this.selectedBuilding !== undefined
    ) {
      this.fetchAndRender()
    }

    if (
      changes["selectedStorey"] !== undefined &&
      this.storeyService.storeys.length > 0
    ) {
      this.highlightSelectedFloor()
    }

    if (changes["hideNotSelectedStoreys"] != null && this.scene != null) {
      this.updateVisibility()
    }

    if (
      changes["selectedRoom"] !== undefined &&
      this.selectedRoom !== undefined
    ) {
      this.updateActiveRoomVisuals(this.selectedRoom)
    }

    if (
      (changes["storeys"] !== undefined &&
        !changes["storeys"].isFirstChange()) ||
      (changes["rooms"] !== undefined && !changes["rooms"].isFirstChange())
    ) {
      this.renderScene()
    }
    this.updateVisibility()
  }

  public ngAfterViewInit(): void {
    this.initScene()
    void this.loadFont().then(() => {
      this.animate() // Lance la boucle de rendu 60fps
      if (this.selectedBuilding !== undefined) {
        this.fetchAndRender()
      }
    })
  }

  protected fetchAndRender(): void {
    if (!this.selectedBuilding) return
    this.storeyService
      .getByBuildingId(this.selectedBuilding.id)
      .subscribe(() => {
        this.renderScene()
        this.highlightSelectedFloor()
      })
  }

  public ngOnDestroy(): void {
    if (this.animationId !== undefined) {
      cancelAnimationFrame(this.animationId)
    }
    this.renderer.domElement.removeEventListener("click", this.onCanvasClick)
    this.renderer.dispose()
  }

  protected onCanvasClick = (event: MouseEvent): void => {
    // Ignore clicks while orbiting
    if (this.isOrbiting) {
      return
    }

    const rect = this.renderer.domElement.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.mouse.set(x, y)
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true,
    )

    for (const intersect of intersects) {
      let obj: THREE.Object3D | null = intersect.object
      while (obj != null && !(obj instanceof THREE.Group)) {
        obj = obj.parent
      }
      if (
        obj instanceof THREE.Group &&
        obj.userData.floorIndex != null &&
        obj.visible
      ) {
        const idx = Number(obj.userData.floorIndex)
        if (!Number.isNaN(idx) && idx !== this.selectedFloorIndex) {
          this.selectedFloorIndex = idx
          this.highlightSelectedFloor()
          // Emit the clicked storey
          const storey = this.storeyService.storeys[idx]
          if (storey !== undefined) {
            this.storeySelected.emit(storey)
          }
          break
        } else {
          break // break if clicked on the same floor
        }
      }
    }
  }

  protected highlightSelectedFloor(): void {
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

    const target = new THREE.Vector3(
      0,
      this.selectedFloorIndex * this.FLOOR_SPACING,
      0,
    )
    const offset = new THREE.Vector3(25, 7, 25)
    this.cameraTarget.copy(target)
    this.cameraPosTarget.copy(target.clone().add(offset))
    this.isAnimatingToFloor = true
    this.updateVisibility()
  }

  protected addPlaneFloorTextureToStorey(
    imageUrl: string,
    floorGroup: THREE.Group,
  ): void {
    const textureLoader = new THREE.TextureLoader()

    textureLoader.load(
      imageUrl,
      (texture) => {
        const planeGeometry = new THREE.PlaneGeometry(
          this.FLOOR_WIDTH,
          this.FLOOR_LENGTH,
        )

        const planeMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: this.FLOOR_PLAN_OPACITY,
        })

        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
        planeMesh.position.set(0, 0.11, 0)
        planeMesh.rotation.x = -Math.PI / 2

        planeMesh.userData = { type: "FLOOR_PLAN" }
        floorGroup.add(planeMesh)
      },
      undefined,
      (error) => {
        console.error("Error loading floor plan texture:", error)
      },
    )
  }

  protected updateVisibility(): void {
    if (!this.scene) return
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Group && obj.userData.floorIndex != null) {
        const idx = Number(obj.userData.floorIndex)
        obj.visible =
          !this.hideNotSelectedStoreys || idx === this.selectedFloorIndex
      }
    })
  }

  protected initScene(): void {
    const container = this.canvasContainer.nativeElement
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(this.renderer.domElement)

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color("#e2e8f0")

    this.camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )
    this.camera.position.set(25, 15, 25)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.minDistance = 5
    this.controls.maxDistance = 80
    this.controls.maxPolarAngle = Math.PI / 2
    this.controls.addEventListener("start", () => {
      this.isOrbiting = false
      this.isAnimatingToFloor = false
    })

    // if changes, then we are orbiting, should prevent misclicks on floors
    this.controls.addEventListener("change", () => {
      this.isOrbiting = true
    })

    this.controls.addEventListener("end", () => {
      setTimeout(() => {
        this.isOrbiting = false
      }, 100)
    })

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(20, 30, 20)
    this.scene.add(dirLight)

    const grid = new THREE.GridHelper(50, 50, "#cbd5e1", "#e2e8f0")
    grid.position.set(0, -0.1, 0)
    this.scene.add(grid)

    this.renderer.domElement.addEventListener("click", this.onCanvasClick)

    window.addEventListener("pointermove", this.handlePointerMove)
    window.addEventListener("pointerup", this.handlePointerUp)
    this.renderer.domElement.addEventListener(
      "pointerdown",
      this.handlePointerDownGlobal,
    )
  }

  protected async loadFont(): Promise<void> {
    const loader = new FontLoader()
    return new Promise((resolve) => {
      loader.load(
        "https://threejs.org/examples/fonts/gentilis_regular.typeface.json",
        (f) => {
          this.font = f
          resolve()
        },
      )
    })
  }

  // --- Rendu (Rendering) ---

  protected renderScene(): void {
    if (!this.scene) return

    // Nettoyage : on ne supprime que les étages, pas les lumières ni la grille
    const objectsToRemove: THREE.Object3D[] = []
    this.scene.traverse((child) => {
      if (
        child instanceof THREE.Group &&
        child.userData["isFloorGroup"] === true
      ) {
        objectsToRemove.push(child)
      }
    })
    for (const obj of objectsToRemove) {
      this.scene.remove(obj)
    }

    if (!this.storeyService.storeys) return

    for (const floor of this.storeyService.storeys) {
      const index = this.storeyService.storeys.indexOf(floor)
      this.renderFloor(floor, index)
    }
    this.updateVisibility()
  }

  protected renderFloor(floor: Storey, index: number): void {
    // const floorWidth = 20
    // const floorLength = 15
    // const floorThickness = 0.3 // Épaisseur de la dalle
    const y = index * this.FLOOR_SPACING
    const group = new THREE.Group()
    group.position.set(0, y, 0)
    group.userData.floorIndex = index
    group.visible = true

    group.position.set(0, index * this.FLOOR_SPACING, 0)
    group.userData = {
      isFloorGroup: true,
      floorIndex: index,
      floorId: floor.id,
    }

    // Dalle
    const slabGeom = new THREE.BoxGeometry(
      this.FLOOR_WIDTH,
      this.FLOOR_THICKNESS,
      this.FLOOR_LENGTH,
    )
    const isSelected = index === this.selectedFloorIndex
    const slabMat = new THREE.MeshStandardMaterial({
      color: isSelected ? "#e0f2fe" : "#f0f0f0",
      transparent: true,
      opacity: 0.9,
    })
    const slab = new THREE.Mesh(slabGeom, slabMat)
    slab.receiveShadow = true
    group.add(slab)

    // Texte
    if (this.font !== undefined) {
      const textGeom = new TextGeometry(floor.name, {
        font: this.font,
        size: 0.5,
        depth: 0.05,
      })
      const textMat = new THREE.MeshStandardMaterial({
        color: isSelected ? "#0ea5e9" : "#64748b",
      })
      const textMesh = new THREE.Mesh(textGeom, textMat)
      textMesh.position.set(
        -this.FLOOR_WIDTH / 2,
        0.4,
        -this.FLOOR_LENGTH / 2 - 1,
      )
      group.add(textMesh)
    }

    // Floor Plan (if available)
    if (this.storeyFloorPlans && this.storeyFloorPlans.has(floor.id)) {
      const imageUrl = this.storeyFloorPlans.get(floor.id)
      if (imageUrl == null) {
        return
      }
      this.addPlaneFloorTextureToStorey(imageUrl, group)
    }

    // Rooms
    this.roomService.fetchByStoreyId(floor.id).subscribe((rooms) => {
      for (const room of rooms) {
        this.renderRoom(group, room)
      }
    })

    this.scene.add(group)
  }

  protected renderRoom(parentGroup: THREE.Group, room: Room): void {
    const roomGroup = new THREE.Group()
    const w = room.width * this.SCALE
    const d = room.depth * this.SCALE
    const x = room.x * this.SCALE
    const z = room.z * this.SCALE

    roomGroup.position.set(x, 0.25, z)
    roomGroup.userData = { roomId: room.id, storeyId: room.storeyId } // IMPORTANT : ID de la room

    // 1. Le Corps de la pièce
    const geometry = new THREE.BoxGeometry(w, this.ROOM_THICKNESS, d)
    const material = new THREE.MeshStandardMaterial({
      color: room.color ?? "#d1d5db",
      transparent: true,
      opacity: 0.8,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = { type: "ROOM_BODY", room }
    roomGroup.add(mesh)

    // 2. Affichage du nom de la pièce
    if (this.font) {
      const textGeo = new TextGeometry(room.name, {
        font: this.font,
        size: 0.4,
        depth: 0.02,
        curveSegments: 3,
      })

      textGeo.computeBoundingBox()
      const box = textGeo.boundingBox
      if (box) {
        const xOffset = -0.5 * (box.max.x - box.min.x)
        const zOffset = -0.5 * (box.max.y - box.min.y)
        const textMat = new THREE.MeshBasicMaterial({
          color: room.color ?? "#000000",
          toneMapped: false,
        })
        const textMesh = new THREE.Mesh(textGeo, textMat)
        textMesh.rotation.x = -Math.PI / 2
        textMesh.position.set(xOffset, 0.3, zOffset)
        textMesh.userData = { type: "ROOM_TEXT" }
        roomGroup.add(textMesh)
      }
    }

    // 3. Poignées (seulement sur l'étage actif)
    if (parentGroup.userData["floorIndex"] === this.selectedFloorIndex) {
      const handleSize = 0.4
      const handleGeo = new THREE.BoxGeometry(
        handleSize,
        handleSize + 0.1,
        handleSize,
      )
      const handleMat = new THREE.MeshBasicMaterial({ color: 0xffffff })

      const createHandle = (hx: number, hz: number, name: string): void => {
        const h = new THREE.Mesh(handleGeo, handleMat)
        h.position.set(hx, 0, hz)
        h.userData = { type: "RESIZE_HANDLE", handleName: name, room }
        roomGroup.add(h)
      }
      createHandle(-w / 2, -d / 2, "TL")
      createHandle(w / 2, -d / 2, "TR")
      createHandle(-w / 2, d / 2, "BL")
      createHandle(w / 2, d / 2, "BR")
    }
    parentGroup.add(roomGroup)
  }

  // --- MISE À JOUR VISUELLE LIVE ---
  private updateActiveRoomVisuals(updatedRoom: Room): void {
    if (!this.scene || !this.font) return

    // 1. Trouver le groupe de l'étage actuel
    const floorGroup = this.scene.children.find(
      (c) =>
        c.userData["isFloorGroup"] === true &&
        c.userData["floorIndex"] === this.selectedFloorIndex,
    ) as THREE.Group | undefined

    if (!floorGroup) return

    // 2. Trouver le groupe de la pièce spécifique via son ID
    const roomGroup = floorGroup.children.find(
      (c) => c.userData["roomId"] === updatedRoom.id,
    ) as THREE.Group | undefined

    if (!roomGroup) return

    // 3. Mettre à jour les enfants (Corps et Texte)
    roomGroup.children.forEach((child) => {
      const type = child.userData["type"]

      // A. Mise à jour de la COULEUR du corps
      if (type === "ROOM_BODY" && child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial
        mat.color.set(updatedRoom.color)
      }

      // B. Mise à jour du TEXTE (Nom + Couleur)
      if (type === "ROOM_TEXT" && child instanceof THREE.Mesh) {
        child.geometry.dispose()

        if (!this.font) {
          console.error("Font not loaded yet")
          return
        }

        const textGeo = new TextGeometry(updatedRoom.name, {
          font: this.font,
          size: 0.4,
          depth: 0.02,
          curveSegments: 3,
        })

        // Recalcul du centrage
        textGeo.computeBoundingBox()
        const box = textGeo.boundingBox
        if (box) {
          const xOffset = -0.5 * (box.max.x - box.min.x)
          const zOffset = -0.5 * (box.max.y - box.min.y)
          child.position.set(xOffset, 0.3, zOffset)
        }

        child.geometry = textGeo
        const mat = child.material as THREE.MeshBasicMaterial
        mat.color.set(updatedRoom.color)
      }
    })
  }

  // --- LOGIQUE GHOST & INTERACTION ---

  private createGhost(
    room: Room,
    originalRoomMesh: THREE.Mesh,
    floorGroup: THREE.Object3D,
  ): void {
    this.removeGhost()
    this.originalMeshHidden = originalRoomMesh
    this.originalMeshHidden.visible = false

    const w = room.width * this.SCALE
    const d = room.depth * this.SCALE
    const x = room.x * this.SCALE
    const z = room.z * this.SCALE

    const geometry = new THREE.BoxGeometry(w, this.ROOM_THICKNESS, d)
    const material = new THREE.MeshStandardMaterial({
      color: room.color ?? "#3b82f6",
      transparent: true,
      opacity: 0.6,
      emissive: 0x444444,
    })

    this.ghostMesh = new THREE.Mesh(geometry, material)
    floorGroup.add(this.ghostMesh)
    this.ghostMesh.position.set(x, 0.25, z)

    this.ghostData = { x: room.x, z: room.z, w: room.width, d: room.depth }
  }

  private removeGhost(): void {
    if (this.ghostMesh) {
      if (this.ghostMesh.parent) this.ghostMesh.parent.remove(this.ghostMesh)
      if (this.ghostMesh.geometry) this.ghostMesh.geometry.dispose()
      const mat = this.ghostMesh.material
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else if (mat instanceof THREE.Material) mat.dispose()

      this.ghostMesh = null
    }
    this.ghostData = null

    if (this.originalMeshHidden) {
      this.originalMeshHidden.visible = true
      this.originalMeshHidden = null
    }
  }

  private updateGhostVisuals(): void {
    if (!this.ghostMesh || !this.ghostData) return

    const w = this.ghostData.w * this.SCALE
    const d = this.ghostData.d * this.SCALE
    const x = this.ghostData.x * this.SCALE
    const z = this.ghostData.z * this.SCALE

    if (this.interactionState === "RESIZING") {
      this.ghostMesh.geometry.dispose()
      this.ghostMesh.geometry = new THREE.BoxGeometry(w, this.ROOM_THICKNESS, d)
    }

    this.ghostMesh.position.set(x, 0.25, z)
  }

  // --- DÉTECTION DE COLLISION (HARD) ---
  private checkCollision(
    target: { x: number; z: number; w: number; d: number },
    otherRooms: Room[],
  ): boolean {
    const epsilon = 0.1
    const tLeft = target.x - target.w / 2 + epsilon
    const tRight = target.x + target.w / 2 - epsilon
    const tTop = target.z - target.d / 2 + epsilon
    const tBottom = target.z + target.d / 2 - epsilon

    for (const room of otherRooms) {
      if (room.id === this.activeRoom?.id) continue

      const rLeft = room.x - room.width / 2
      const rRight = room.x + room.width / 2
      const rTop = room.z - room.depth / 2
      const rBottom = room.z + room.depth / 2

      const isOverlapping =
        tLeft < rRight && tRight > rLeft && tTop < rBottom && tBottom > rTop
      if (isOverlapping) return true
    }
    return false
  }

  protected handlePointerDownGlobal = (event: PointerEvent): void => {
    const mouse = this.getMouseNormalized(event)
    this.raycaster.setFromCamera(mouse, this.camera)

    const activeFloor = this.scene.children.find(
      (c) =>
        c.userData["isFloorGroup"] === true &&
        c.userData["floorIndex"] === this.selectedFloorIndex,
    )
    if (!activeFloor) return

    const intersects = this.raycaster.intersectObjects(
      activeFloor.children,
      true,
    )
    if (intersects.length === 0) return

    const hit = intersects[0]
    if (!hit) return

    const data = hit.object.userData
    if (!data["room"]) return

    event.preventDefault()
    event.stopPropagation()

    this.controls.enabled = false
    const room = data["room"] as Room
    this.activeRoom = room
    this.activeHandle = data["handleName"]
      ? (data["handleName"] as string)
      : null

    this.interactionState =
      data["type"] === "RESIZE_HANDLE" ? "RESIZING" : "DRAGGING"

    let meshToHide: THREE.Mesh
    if (data["type"] === "RESIZE_HANDLE") {
      const roomGroup = hit.object.parent
      meshToHide = roomGroup?.children.find(
        (c) => c.userData["type"] === "ROOM_BODY",
      ) as THREE.Mesh
    } else {
      meshToHide = hit.object as THREE.Mesh
    }

    if (meshToHide) {
      this.createGhost(room, meshToHide, activeFloor)
    }

    this.startData = {
      roomX: room.x,
      roomZ: room.z,
      roomW: room.width,
      roomD: room.depth,
      mouseX: hit.point.x,
      mouseZ: hit.point.z,
    }
    document.body.style.cursor =
      this.interactionState === "RESIZING" ? "nwse-resize" : "grabbing"
  }

  protected handlePointerMove = (event: PointerEvent): void => {
    if (
      this.interactionState === "IDLE" ||
      !this.activeRoom ||
      !this.startData ||
      !this.ghostData
    )
      return

    const mouse = this.getMouseNormalized(event)
    this.raycaster.setFromCamera(mouse, this.camera)
    const floorY = this.selectedFloorIndex * this.FLOOR_SPACING
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -floorY)
    const point = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(plane, point)

    const dx3D = point.x - this.startData.mouseX
    const dz3D = point.z - this.startData.mouseZ
    const dx = Math.round(dx3D / this.SCALE)
    const dz = Math.round(dz3D / this.SCALE)

    const currentFloorRooms = this.roomService.rooms.filter(
      (r) => r.storeyId === this.activeRoom?.storeyId,
    )

    if (this.interactionState === "DRAGGING") {
      // Axe X
      let nextX = this.startData.roomX + dx
      const floorSizeX = this.FLOOR_WIDTH / this.SCALE
      const maxX = floorSizeX / 2 - this.ghostData.w / 2
      nextX = Math.round(Math.max(-maxX, Math.min(maxX, nextX)))

      const testX = { ...this.ghostData, x: nextX }
      if (!this.checkCollision(testX, currentFloorRooms)) {
        this.ghostData.x = nextX
      }

      // Axe Z
      let nextZ = this.startData.roomZ + dz
      const floorSizeZ = this.FLOOR_LENGTH / this.SCALE
      const maxZ = floorSizeZ / 2 - this.ghostData.d / 2
      nextZ = Math.round(Math.max(-maxZ, Math.min(maxZ, nextZ)))

      const testZ = { ...this.ghostData, z: nextZ }
      if (!this.checkCollision(testZ, currentFloorRooms)) {
        this.ghostData.z = nextZ
      }
    } else if (this.interactionState === "RESIZING" && this.activeHandle) {
      let newW = this.startData.roomW
      let newD = this.startData.roomD
      let newX = this.startData.roomX
      let newZ = this.startData.roomZ

      switch (this.activeHandle) {
        case "TR":
          newW += dx
          newD -= dz
          newX += dx / 2
          newZ += dz / 2
          break
        case "BR":
          newW += dx
          newD += dz
          newX += dx / 2
          newZ += dz / 2
          break
        case "TL":
          newW -= dx
          newD -= dz
          newX += dx / 2
          newZ += dz / 2
          break
        case "BL":
          newW -= dx
          newD += dz
          newX += dx / 2
          newZ += dz / 2
          break
      }

      if (newW < 20) newW = 20
      if (newD < 20) newD = 20
      newX = Math.round(newX)
      newZ = Math.round(newZ)
      newW = Math.round(newW)
      newD = Math.round(newD)

      const candidate = { x: newX, z: newZ, w: newW, d: newD }
      const floorSizeX = this.FLOOR_WIDTH / this.SCALE
      const floorSizeZ = this.FLOOR_LENGTH / this.SCALE
      const insideFloor =
        newX - newW / 2 >= -floorSizeX / 2 &&
        newX + newW / 2 <= floorSizeX / 2 &&
        newZ - newD / 2 >= -floorSizeZ / 2 &&
        newZ + newD / 2 <= floorSizeZ / 2

      if (!this.checkCollision(candidate, currentFloorRooms) && insideFloor) {
        this.ghostData = candidate
      }
    }
    this.updateGhostVisuals()
  }

  protected handlePointerUp = (): void => {
    if (
      this.interactionState !== "IDLE" &&
      this.activeRoom &&
      this.ghostData &&
      this.originalMeshHidden
    ) {
      const finalX = this.ghostData.x
      const finalZ = this.ghostData.z
      const finalW = this.ghostData.w
      const finalD = this.ghostData.d

      this.activeRoom.x = finalX
      this.activeRoom.z = finalZ
      this.activeRoom.width = finalW
      this.activeRoom.depth = finalD

      this.applyChangesToOriginalMesh()

      this.roomService
        .update(this.activeRoom.id, {
          x: finalX,
          z: finalZ,
          width: finalW,
          depth: finalD,
          color: this.activeRoom.color,
        })
        .subscribe({
          next: () => console.log("Sauvegarde OK"),
          error: (e) => console.error("Erreur sauvegarde", e),
        })
    }

    this.removeGhost()
    this.interactionState = "IDLE"
    this.activeRoom = null
    this.activeHandle = null
    this.startData = undefined
    this.controls.enabled = true
    document.body.style.cursor = "default"
  }

  private applyChangesToOriginalMesh(): void {
    if (!this.originalMeshHidden || !this.ghostData || !this.activeRoom) return

    const w = this.ghostData.w * this.SCALE
    const d = this.ghostData.d * this.SCALE
    const x = this.ghostData.x * this.SCALE
    const z = this.ghostData.z * this.SCALE

    const roomGroup = this.originalMeshHidden.parent
    if (roomGroup) {
      roomGroup.position.set(x, 0.25, z)

      if (this.interactionState === "RESIZING") {
        const hw = w / 2
        const hd = d / 2
        roomGroup.children.forEach((child) => {
          const type = child.userData["type"]
          if (type === "RESIZE_HANDLE") {
            const name = child.userData["handleName"]
            switch (name) {
              case "TL":
                child.position.set(-hw, 0, -hd)
                break
              case "TR":
                child.position.set(hw, 0, -hd)
                break
              case "BL":
                child.position.set(-hw, 0, hd)
                break
              case "BR":
                child.position.set(hw, 0, hd)
                break
            }
          }
          if (type === "ROOM_BODY" && child instanceof THREE.Mesh) {
            child.geometry.dispose()
            child.geometry = new THREE.BoxGeometry(w, this.ROOM_THICKNESS, d)
          }
        })
      }
    }

    this.originalMeshHidden.visible = true
    this.originalMeshHidden = null
  }

  protected getMouseNormalized(event: PointerEvent): THREE.Vector2 {
    const rect = this.renderer.domElement.getBoundingClientRect()
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )
  }

  protected animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate)
    if (this.isAnimatingToFloor) {
      this.camera.position.lerp(this.cameraPosTarget, 0.05)
      this.controls.target.lerp(this.cameraTarget, 0.05)
      if (this.camera.position.distanceTo(this.cameraPosTarget) < 0.1) {
        this.isAnimatingToFloor = false
      }
    }
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}
