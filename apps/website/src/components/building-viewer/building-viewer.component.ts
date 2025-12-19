import {
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
  NgZone,
  ChangeDetectionStrategy,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { Font, FontLoader } from "three/addons/loaders/FontLoader.js"
import { TextGeometry } from "three/addons/geometries/TextGeometry.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js"
import type {
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import type { Building } from "@repo/models/Building"
import type { Storey } from "@repo/models/Storey"
import type { Room } from "@repo/models/Room"
import type { FurnitureWithRelations } from "@repo/models/Furniture"
import { BuildingService } from "../../services/building.service"
import { StoreyService } from "../../services/storey.service"
import { RoomService } from "../../services/room.service"
import { FurnitureService } from "../../services/furniture.service"

@Component({
  selector: "app-building-viewer-3d",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./building-viewer.component.html",
  styleUrls: ["./building-viewer.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingViewer3dComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild("canvasContainer", { static: true })
  protected canvasContainer!: ElementRef<HTMLDivElement>
  protected readonly buildingService = inject(BuildingService)
  protected readonly storeyService = inject(StoreyService)
  protected readonly roomService = inject(RoomService)
  protected readonly furnitureService = inject(FurnitureService)
  private readonly ngZone = inject(NgZone)

  @Input() public selectedBuilding!: Building
  @Input() public selectedStorey!: Storey
  @Input() public selectedRoom!: Room
  @Input() public selectedFurniture!: FurnitureWithRelations
  @Input() public storeys!: Storey[]
  @Input() public rooms!: Room[]
  @Input() public furnitures!: FurnitureWithRelations[]

  protected renderer!: THREE.WebGLRenderer
  protected scene!: THREE.Scene
  protected camera!: THREE.PerspectiveCamera
  protected controls!: OrbitControls
  protected raycaster = new THREE.Raycaster()
  protected animationId?: number
  protected font?: Font

  private readonly CONFIG = {
    SPACING: 5,
    WIDTH: 20,
    LENGTH: 15,
    FLOOR_THICKNESS: 0.2,
    SCALE: 0.05,
    ROOM_THICKNESS: 0.05,
  }
  protected selectedFloorIndex = 0
  protected cameraTarget = new THREE.Vector3()
  protected cameraPosTarget = new THREE.Vector3()
  protected isAnimatingToFloor = false
  protected interactionState:
    | "IDLE"
    | "DRAGGING"
    | "RESIZING"
    | "DRAGGING_FURNITURE" = "IDLE"
  protected activeRoom: Room | null = null
  protected activeHandle: string | null = null
  protected ghostMesh: THREE.Mesh | null = null
  protected originalMeshHidden: THREE.Object3D | null = null
  protected ghostData: { x: number; z: number; w: number; d: number } | null =
    null

  protected ghostFurnitureMesh: THREE.Object3D | null = null
  protected originalFurnitureHidden: THREE.Object3D | null = null
  protected activeFurniture: FurnitureWithRelations | null = null
  protected ghostFurnitureData: { x: number; z: number } | null = null
  protected startFurnitureData?: {
    furnX: number
    furnZ: number
    mouseX: number
    mouseZ: number
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  }
  protected startData?: {
    roomX: number
    roomZ: number
    roomW: number
    roomD: number
    mouseX: number
    mouseZ: number
  }

  private readonly modelCache = new Map<string, THREE.Group>()
  private readonly loader = new GLTFLoader()
  private readonly sharedBoxGeo = new THREE.BoxGeometry(1, 1, 1)
  private readonly matCache = new Map<string, THREE.Material>()

  constructor() {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
    )
    this.loader.setDRACOLoader(dracoLoader)
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedBuilding"]?.currentValue) this.fetchAndRender()
    if (
      changes["selectedStorey"]?.currentValue &&
      this.storeyService.storeys.length
    ) {
      this.updateSelectedFloorIndex()
      this.highlightSelectedFloor()
    }
    if (changes["selectedRoom"]?.currentValue)
      this.updateActiveRoomVisuals(this.selectedRoom)
    if (
      (changes["storeys"] && !changes["storeys"].isFirstChange()) ||
      (changes["rooms"] && !changes["rooms"].isFirstChange()) ||
      changes["furnitures"]
    ) {
      if (this.interactionState === "IDLE") {
        this.renderScene()
      }
    }
  }

  public ngAfterViewInit(): void {
    this.initScene()
    void this.loadFont().then(() => {
      this.ngZone.runOutsideAngular(() => {
        this.animate()
        window.addEventListener("pointermove", this.handlePointerMove)
        window.addEventListener("pointerup", this.handlePointerUp)
        this.renderer.domElement.addEventListener(
          "pointerdown",
          this.handlePointerDownGlobal,
        )
      })
      if (this.selectedBuilding) this.fetchAndRender()
    })
  }

  public ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId)
    window.removeEventListener("pointermove", this.handlePointerMove)
    window.removeEventListener("pointerup", this.handlePointerUp)
    if (this.renderer) {
      this.renderer.domElement.removeEventListener(
        "pointerdown",
        this.handlePointerDownGlobal,
      )
      this.renderer.dispose()
    }
    this.cleanObj(this.scene)
    this.sharedBoxGeo.dispose()
    this.matCache.forEach((m) => m.dispose())
  }

  private updateSelectedFloorIndex(): void {
    if (!this.selectedStorey) return
    const idx = this.storeyService.storeys.findIndex(
      (s) => s.id === this.selectedStorey.id,
    )
    this.selectedFloorIndex = idx !== -1 ? idx : 0
  }

  protected fetchAndRender(): void {
    if (!this.selectedBuilding) return
    this.storeyService
      .getByBuildingId(this.selectedBuilding.id)
      .subscribe(() => {
        this.updateSelectedFloorIndex()
        this.renderScene()
        this.highlightSelectedFloor()
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
    this.controls.addEventListener(
      "start",
      () => (this.isAnimatingToFloor = false),
    )
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(20, 30, 20)
    this.scene.add(dirLight)
    const grid = new THREE.GridHelper(50, 50, "#cbd5e1", "#e2e8f0")
    grid.position.set(0, -0.1, 0)
    this.scene.add(grid)
  }

  protected async loadFont(): Promise<void> {
    const loader = new FontLoader()
    return new Promise((resolve) =>
      loader.load(
        "https://threejs.org/examples/fonts/gentilis_regular.typeface.json",
        (f) => {
          this.font = f
          resolve()
        },
      ),
    )
  }

  private getMat(color: string, opacity = 1): THREE.Material {
    const key = `${color}-${opacity}`
    if (!this.matCache.has(key)) {
      this.matCache.set(
        key,
        new THREE.MeshStandardMaterial({ color, transparent: true, opacity }),
      )
    }
    return this.matCache.get(key)!
  }

  private cleanObj(obj: THREE.Object3D): void {
    if (!obj) return
    obj.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        ;(c as THREE.Mesh).geometry?.dispose()
        const m = (c as THREE.Mesh).material
        if (Array.isArray(m)) m.forEach((Mat) => Mat.dispose())
        else if (m) m.dispose()
      }
    })
  }

  protected renderScene(): void {
    if (this.interactionState !== "IDLE") return

    if (!this.scene) return
    const toRemove: THREE.Object3D[] = []
    this.scene.traverse((c) => {
      if (c.userData["isFloorGroup"]) toRemove.push(c)
    })
    toRemove.forEach((o) => {
      this.cleanObj(o)
      this.scene.remove(o)
    })
    this.storeyService.storeys?.forEach((floor, idx) =>
      this.renderFloor(floor, idx),
    )
  }

  protected renderFloor(floor: Storey, index: number): void {
    const group = new THREE.Group()
    group.position.set(0, index * this.CONFIG.SPACING, 0)
    group.userData = {
      isFloorGroup: true,
      floorIndex: index,
      floorId: floor.id,
    }
    const isSelected = index === this.selectedFloorIndex
    const slab = new THREE.Mesh(
      this.sharedBoxGeo,
      this.getMat(isSelected ? "#e0f2fe" : "#f0f0f0", 0.9),
    )
    slab.scale.set(
      this.CONFIG.WIDTH,
      this.CONFIG.FLOOR_THICKNESS,
      this.CONFIG.LENGTH,
    )
    slab.receiveShadow = true
    group.add(slab)

    if (this.font) {
      const textMesh = new THREE.Mesh(
        new TextGeometry(floor.name, {
          font: this.font,
          size: 0.5,
          depth: 0.05,
        }),
        this.getMat(isSelected ? "#0ea5e9" : "#64748b"),
      )
      textMesh.position.set(
        -this.CONFIG.WIDTH / 2,
        0.4,
        -this.CONFIG.LENGTH / 2 - 1,
      )
      group.add(textMesh)
    }
    this.roomService
      .fetchByStoreyId(floor.id)
      .subscribe((rooms) => rooms.forEach((r) => this.renderRoom(group, r)))
    this.scene.add(group)
  }

  protected renderRoom(parentGroup: THREE.Group, room: Room): void {
    const roomGroup = new THREE.Group()
    const w = room.width * this.CONFIG.SCALE,
      d = room.depth * this.CONFIG.SCALE,
      x = room.x * this.CONFIG.SCALE,
      z = room.z * this.CONFIG.SCALE
    roomGroup.position.set(x, 0.25, z)
    roomGroup.userData = {
      roomId: room.id,
      storeyId: room.storeyId,
      isRoomGroup: true,
    }
    const mesh = new THREE.Mesh(
      this.sharedBoxGeo,
      this.getMat(room.color ?? "#d1d5db", 0.8),
    )
    mesh.scale.set(w, this.CONFIG.ROOM_THICKNESS, d)
    mesh.userData = { type: "ROOM_BODY", room }
    roomGroup.add(mesh)

    if (this.font) {
      const textGeo = new TextGeometry(room.name, {
        font: this.font,
        size: 0.4,
        depth: 0.02,
        curveSegments: 3,
      })
      textGeo.computeBoundingBox()
      const box = textGeo.boundingBox!
      const textMesh = new THREE.Mesh(
        textGeo,
        new THREE.MeshBasicMaterial({
          color: room.color ?? "#000000",
          toneMapped: false,
        }),
      )
      textMesh.rotation.x = -Math.PI / 2
      textMesh.position.set(
        -0.5 * (box.max.x - box.min.x),
        0.3,
        -0.5 * (box.max.y - box.min.y),
      )
      textMesh.userData = { type: "ROOM_TEXT" }
      roomGroup.add(textMesh)
    }

    if (parentGroup.userData["floorIndex"] === this.selectedFloorIndex) {
      const handleMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const createHandle = (hx: number, hz: number, name: string) => {
        const h = new THREE.Mesh(this.sharedBoxGeo, handleMat)
        h.scale.set(0.4, 0.5, 0.4)
        h.position.set(hx, 0, hz)
        h.userData = { type: "RESIZE_HANDLE", handleName: name, room }
        roomGroup.add(h)
      }
      createHandle(-w / 2, -d / 2, "TL")
      createHandle(w / 2, -d / 2, "TR")
      createHandle(-w / 2, d / 2, "BL")
      createHandle(w / 2, d / 2, "BR")
    }
    this.furnitures
      ?.filter((f) => f.roomId === room.id)
      .forEach((f) => this.renderFurniture(roomGroup, f))
    parentGroup.add(roomGroup)
  }

  protected renderFurniture(
    roomGroup: THREE.Group,
    furniture: FurnitureWithRelations,
  ): void {
    if (!furniture.model) return
    if (this.modelCache.has(furniture.model)) {
      this.setupFurnitureMesh(
        this.modelCache.get(furniture.model)!.clone(),
        roomGroup,
        furniture,
      )
      return
    }
    this.loader.load(furniture.model, (gltf) => {
      const model = gltf.scene
      const box = new THREE.Box3().setFromObject(model)
      const size = new THREE.Vector3()
      box.getSize(size)
      const scale = 1.5 / Math.max(size.x, size.y, size.z)
      model.scale.set(scale, scale, scale)
      this.modelCache.set(furniture.model!, model.clone())
      this.setupFurnitureMesh(model, roomGroup, furniture)
    })
  }

  private setupFurnitureMesh(
    mesh: THREE.Object3D,
    roomGroup: THREE.Group,
    furniture: FurnitureWithRelations,
  ): void {
    mesh.position.set(0, 0, 0)
    mesh.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(mesh)
    const yOffset = this.CONFIG.ROOM_THICKNESS / 2 - box.min.y
    mesh.position.set(
      furniture.x * this.CONFIG.SCALE,
      yOffset,
      furniture.z * this.CONFIG.SCALE,
    )
    mesh.userData = {
      type: "FURNITURE",
      id: furniture.id,
      originalData: furniture,
      initialY: yOffset,
    }
    mesh.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        c.castShadow = true
        c.receiveShadow = true
      }
    })
    roomGroup.add(mesh)
  }

  private updateActiveRoomVisuals(updatedRoom: Room): void {
    const floorGroup = this.scene?.children.find(
      (c) =>
        c.userData["isFloorGroup"] &&
        c.userData["floorIndex"] === this.selectedFloorIndex,
    )
    const roomGroup = floorGroup?.children.find(
      (c) => c.userData["roomId"] === updatedRoom.id,
    )
    if (!roomGroup) return
    roomGroup.children.forEach((child) => {
      if (child.userData["type"] === "ROOM_BODY" && child instanceof THREE.Mesh)
        (child.material as THREE.MeshStandardMaterial).color.set(
          updatedRoom.color,
        )
      if (
        child.userData["type"] === "ROOM_TEXT" &&
        child instanceof THREE.Mesh &&
        this.font
      ) {
        child.geometry.dispose()
        const textGeo = new TextGeometry(updatedRoom.name, {
          font: this.font,
          size: 0.4,
          depth: 0.02,
          curveSegments: 3,
        })
        textGeo.computeBoundingBox()
        const box = textGeo.boundingBox!
        child.geometry = textGeo
        child.position.set(
          -0.5 * (box.max.x - box.min.x),
          0.3,
          -0.5 * (box.max.y - box.min.y),
        )
        ;(child.material as THREE.MeshBasicMaterial).color.set(
          updatedRoom.color,
        )
      }
    })
  }

  private createGhost(
    room: Room,
    originalRoomMesh: THREE.Mesh,
    floorGroup: THREE.Object3D,
  ): void {
    this.removeGhost()
    this.originalMeshHidden = originalRoomMesh
    this.originalMeshHidden.visible = false
    const w = room.width * this.CONFIG.SCALE,
      d = room.depth * this.CONFIG.SCALE
    this.ghostMesh = new THREE.Mesh(
      this.sharedBoxGeo,
      this.getMat(room.color ?? "#3b82f6", 0.6),
    )
    this.ghostMesh.scale.set(w, this.CONFIG.ROOM_THICKNESS, d)
    this.ghostMesh.position.set(
      room.x * this.CONFIG.SCALE,
      0.3,
      room.z * this.CONFIG.SCALE,
    )
    floorGroup.add(this.ghostMesh)
    this.ghostData = { x: room.x, z: room.z, w: room.width, d: room.depth }
  }

  private removeGhost(): void {
    if (this.ghostMesh) {
      this.ghostMesh.removeFromParent()
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
    this.ghostMesh.scale.set(
      this.ghostData.w * this.CONFIG.SCALE,
      this.CONFIG.ROOM_THICKNESS,
      this.ghostData.d * this.CONFIG.SCALE,
    )
    // Keep the lifted Y position
    this.ghostMesh.position.set(
      this.ghostData.x * this.CONFIG.SCALE,
      0.3,
      this.ghostData.z * this.CONFIG.SCALE,
    )
  }

  private checkCollision(
    target: { x: number; z: number; w: number; d: number },
    otherRooms: Room[],
  ): boolean {
    const e = 0.1,
      tL = target.x - target.w / 2 + e,
      tR = target.x + target.w / 2 - e,
      tT = target.z - target.d / 2 + e,
      tB = target.z + target.d / 2 - e
    return otherRooms.some((r) => {
      if (r.id === this.activeRoom?.id) return false
      const rL = r.x - r.width / 2,
        rR = r.x + r.width / 2,
        rT = r.z - r.depth / 2,
        rB = r.z + r.depth / 2
      return tL < rR && tR > rL && tT < rB && tB > rT
    })
  }

  protected handlePointerDownGlobal = (event: PointerEvent): void => {
    const mouse = this.getMouseNormalized(event)
    this.raycaster.setFromCamera(mouse, this.camera)
    const activeFloor = this.scene.children.find(
      (c) =>
        c.userData["isFloorGroup"] &&
        c.userData["floorIndex"] === this.selectedFloorIndex,
    )
    if (!activeFloor) return
    const hit = this.raycaster.intersectObjects(activeFloor.children, true)[0]
    if (!hit) return
    let potFurn = hit.object
    while (potFurn && potFurn !== activeFloor) {
      if (potFurn.userData?.["type"] === "FURNITURE") break
      potFurn = potFurn.parent!
    }
    const hitData = hit.object.userData,
      hitRoom = hitData["room"]
    let room: Room | undefined
    if (potFurn && potFurn.userData?.["type"] === "FURNITURE") {
      const rid = potFurn.parent?.userData["roomId"]
      if (rid) room = this.roomService.rooms.find((r) => r.id === rid)
    } else if (hitRoom) room = hitRoom as Room

    if (!room) return
    event.preventDefault()
    event.stopPropagation()
    this.controls.enabled = false
    this.activeRoom = room
    this.activeHandle = null
    this.activeFurniture = null

    if (potFurn && potFurn.userData?.["type"] === "FURNITURE") {
      this.interactionState = "DRAGGING_FURNITURE"
      this.activeFurniture = potFurn.userData["originalData"]
      this.originalFurnitureHidden = potFurn
      this.originalFurnitureHidden!.visible = false
      this.ghostFurnitureMesh = potFurn.clone(true)
      const ip = this.ghostFurnitureMesh.position.clone()
      this.ghostFurnitureMesh.position.set(0, 0, 0)
      this.ghostFurnitureMesh.updateMatrixWorld(true)
      const lb = new THREE.Box3().setFromObject(this.ghostFurnitureMesh)
      this.ghostFurnitureMesh.position.copy(ip)
      this.ghostFurnitureMesh.visible = true

      this.ghostFurnitureMesh.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          const originalMat = c.material
          if (Array.isArray(originalMat)) {
            c.material = (originalMat as THREE.Material[]).map((m) => {
              const clone = m.clone()
              clone.transparent = true
              clone.opacity = 0.6
              return clone
            })
          } else if (originalMat) {
            const clone = originalMat.clone()
            clone.transparent = true
            clone.opacity = 0.6
            c.material = clone
          }
        }
      })

      potFurn.parent?.add(this.ghostFurnitureMesh)
      this.ghostFurnitureData = {
        x: this.activeFurniture!.x,
        z: this.activeFurniture!.z,
      }
      this.startFurnitureData = {
        furnX: this.activeFurniture!.x,
        furnZ: this.activeFurniture!.z,
        mouseX: hit.point.x,
        mouseZ: hit.point.z,
        bounds: {
          minX: lb.min.x,
          maxX: lb.max.x,
          minZ: lb.min.z,
          maxZ: lb.max.z,
        },
      }
      document.body.style.cursor = "grabbing"
      return
    }

    this.activeHandle = hitData["handleName"] || null
    this.interactionState =
      hitData["type"] === "RESIZE_HANDLE" ? "RESIZING" : "DRAGGING"
    const meshToHide =
      hitData["type"] === "RESIZE_HANDLE"
        ? hit.object.parent?.children.find(
            (c) => c.userData["type"] === "ROOM_BODY",
          )
        : hit.object
    if (meshToHide instanceof THREE.Mesh)
      this.createGhost(room, meshToHide, activeFloor)
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
    if (this.interactionState === "IDLE") return
    const mouse = this.getMouseNormalized(event)
    this.raycaster.setFromCamera(mouse, this.camera)
    const pt = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(
      new THREE.Plane(
        new THREE.Vector3(0, 1, 0),
        -(this.selectedFloorIndex * this.CONFIG.SPACING),
      ),
      pt,
    )

    if (
      this.interactionState === "DRAGGING_FURNITURE" &&
      this.startFurnitureData &&
      this.ghostFurnitureData &&
      this.activeRoom
    ) {
      const dx = Math.round(
          (pt.x - this.startFurnitureData.mouseX) / this.CONFIG.SCALE,
        ),
        dz = Math.round(
          (pt.z - this.startFurnitureData.mouseZ) / this.CONFIG.SCALE,
        )
      let nx = this.startFurnitureData.furnX + dx,
        nz = this.startFurnitureData.furnZ + dz
      const rhw = this.activeRoom.width / 2,
        rhd = this.activeRoom.depth / 2
      nx = Math.max(
        -rhw - this.startFurnitureData.bounds.minX / this.CONFIG.SCALE,
        Math.min(
          rhw - this.startFurnitureData.bounds.maxX / this.CONFIG.SCALE,
          nx,
        ),
      )
      nz = Math.max(
        -rhd - this.startFurnitureData.bounds.minZ / this.CONFIG.SCALE,
        Math.min(
          rhd - this.startFurnitureData.bounds.maxZ / this.CONFIG.SCALE,
          nz,
        ),
      )
      this.ghostFurnitureData.x = nx
      this.ghostFurnitureData.z = nz
      this.ghostFurnitureMesh!.position.set(
        nx * this.CONFIG.SCALE,
        this.ghostFurnitureMesh!.userData["initialY"] ?? 0.2,
        nz * this.CONFIG.SCALE,
      )
      return
    }

    if (!this.activeRoom || !this.startData || !this.ghostData) return
    const dx = Math.round((pt.x - this.startData.mouseX) / this.CONFIG.SCALE),
      dz = Math.round((pt.z - this.startData.mouseZ) / this.CONFIG.SCALE)
    const otherRooms = this.roomService.rooms.filter(
      (r) => r.storeyId === this.activeRoom?.storeyId,
    )

    if (this.interactionState === "DRAGGING") {
      let nx = this.startData.roomX + dx,
        nz = this.startData.roomZ + dz
      const limX =
          this.CONFIG.WIDTH / this.CONFIG.SCALE / 2 - this.ghostData.w / 2,
        limZ = this.CONFIG.LENGTH / this.CONFIG.SCALE / 2 - this.ghostData.d / 2
      nx = Math.round(Math.max(-limX, Math.min(limX, nx)))
      nz = Math.round(Math.max(-limZ, Math.min(limZ, nz)))
      // Update position (Visuals will be updated in updateGhostVisuals)
      if (!this.checkCollision({ ...this.ghostData, x: nx }, otherRooms))
        this.ghostData.x = nx
      if (!this.checkCollision({ ...this.ghostData, z: nz }, otherRooms))
        this.ghostData.z = nz
    } else if (this.interactionState === "RESIZING" && this.activeHandle) {
      let nw = this.startData.roomW,
        nd = this.startData.roomD,
        nx = this.startData.roomX,
        nz = this.startData.roomZ
      if (this.activeHandle.includes("R")) {
        nw += dx
        nx += dx / 2
      } else {
        nw -= dx
        nx += dx / 2
      }
      if (this.activeHandle.includes("B")) {
        nd += dz
        nz += dz / 2
      } else {
        nd -= dz
        nz += dz / 2
      }
      if (nw < 20) nw = 20
      if (nd < 20) nd = 20
      const cand = {
        x: Math.round(nx),
        z: Math.round(nz),
        w: Math.round(nw),
        d: Math.round(nd),
      }
      const fsX = this.CONFIG.WIDTH / this.CONFIG.SCALE,
        fsZ = this.CONFIG.LENGTH / this.CONFIG.SCALE
      if (
        cand.x - cand.w / 2 >= -fsX / 2 &&
        cand.x + cand.w / 2 <= fsX / 2 &&
        cand.z - cand.d / 2 >= -fsZ / 2 &&
        cand.z + cand.d / 2 <= fsZ / 2 &&
        !this.checkCollision(cand, otherRooms)
      )
        this.ghostData = cand
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
      Object.assign(this.activeRoom, {
        x: this.ghostData.x,
        z: this.ghostData.z,
        width: this.ghostData.w,
        depth: this.ghostData.d,
      })
      this.applyChangesToOriginalMesh()
      this.roomService.update(this.activeRoom.id, {
        x: this.activeRoom.x,
        z: this.activeRoom.z,
        width: this.activeRoom.width,
        depth: this.activeRoom.depth,
        color: this.activeRoom.color,
      })
    }
    this.removeGhost()
    if (
      this.interactionState === "DRAGGING_FURNITURE" &&
      this.activeFurniture &&
      this.ghostFurnitureData &&
      this.originalFurnitureHidden
    ) {
      this.activeFurniture.x = this.ghostFurnitureData.x
      this.activeFurniture.z = this.ghostFurnitureData.z
      this.originalFurnitureHidden.position.set(
        this.activeFurniture.x * this.CONFIG.SCALE,
        this.originalFurnitureHidden.userData["initialY"] ?? 0.2,
        this.activeFurniture.z * this.CONFIG.SCALE,
      )
      this.originalFurnitureHidden.visible = true
      this.ghostFurnitureMesh?.removeFromParent()
      this.ghostFurnitureMesh = null
      this.originalFurnitureHidden = null
      this.ghostFurnitureData = null
      this.furnitureService.update({
        id: this.activeFurniture.id,
        x: this.activeFurniture.x,
        z: this.activeFurniture.z,
      })
    }
    this.interactionState = "IDLE"
    this.activeRoom = null
    this.activeHandle = null
    this.startData = undefined
    this.activeFurniture = null
    this.controls.enabled = true
    document.body.style.cursor = "default"
  }

  private applyChangesToOriginalMesh(): void {
    if (!this.originalMeshHidden || !this.ghostData || !this.activeRoom) return
    const w = this.ghostData.w * this.CONFIG.SCALE,
      d = this.ghostData.d * this.CONFIG.SCALE
    const group = this.originalMeshHidden.parent
    if (group) {
      group.position.set(
        this.ghostData.x * this.CONFIG.SCALE,
        0.25,
        this.ghostData.z * this.CONFIG.SCALE,
      )
      if (this.interactionState === "RESIZING") {
        const hw = w / 2,
          hd = d / 2
        group.children.forEach((c) => {
          if (c.userData["type"] === "RESIZE_HANDLE") {
            const n = c.userData["handleName"]
            c.position.set(
              n.includes("R") ? hw : -hw,
              0,
              n.includes("B") ? hd : -hd,
            )
          }
          if (c.userData["type"] === "ROOM_BODY" && c instanceof THREE.Mesh)
            c.scale.set(w, this.CONFIG.ROOM_THICKNESS, d)
        })
      }
    }
    this.originalMeshHidden.visible = true
    this.originalMeshHidden = null
  }

  protected highlightSelectedFloor(): void {
    this.isAnimatingToFloor = true
    const ty = this.selectedFloorIndex * this.CONFIG.SPACING
    this.cameraTarget.set(0, ty, 0)
    this.cameraPosTarget.set(25, ty + 15, 25)
  }

  protected getMouseNormalized(event: PointerEvent): THREE.Vector2 {
    const r = this.renderer.domElement.getBoundingClientRect()
    return new THREE.Vector2(
      ((event.clientX - r.left) / r.width) * 2 - 1,
      -((event.clientY - r.top) / r.height) * 2 + 1,
    )
  }

  protected animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate)
    if (this.isAnimatingToFloor) {
      this.camera.position.lerp(this.cameraPosTarget, 0.05)
      this.controls.target.lerp(this.cameraTarget, 0.05)
      if (this.camera.position.distanceTo(this.cameraPosTarget) < 0.1)
        this.isAnimatingToFloor = false
    }
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}
