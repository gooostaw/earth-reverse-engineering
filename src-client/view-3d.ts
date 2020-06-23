import { LitElement, html, css, customElement } from 'lit-element'
import { store } from './store'
import { when, autorun } from 'mobx'
import { MobxLitElement } from '@adobe/lit-mobx'
import * as THREE from 'three'
import { Box2, Vector2 } from 'three'

@customElement('view-3d')
export class View3D extends MobxLitElement {
    canvas: HTMLCanvasElement
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    cube: THREE.Mesh
    loopIsActive = false

    // constructor() {
    //     super()
    // }

    firstUpdated() {
        this.canvas = this.shadowRoot.getElementById('canvas-3d') as HTMLCanvasElement
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
        this.renderer.setClearColor(0x0000ff)
        this.renderer.setSize(300, 300)

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(75, 1)
        this.camera.position.z = 200

        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
        // this.scene.add(this.cube)
        this.cube.position.z = -5
        this.cube.rotation.x = 10
        this.cube.rotation.y = 5

        const pointsArray = []

        for (let i = 0; i < 1000 * 3; i++) {
            pointsArray.push(Math.random() * 2 - 1)
        }

        const pointsGeometry = new THREE.BufferGeometry()
        pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsArray, 3))
        const pointsMaterial = new THREE.PointsMaterial({ color: 0xFFFF00, size: 0.05 })
        const points = new THREE.Points(pointsGeometry, pointsMaterial)
        this.scene.add(points)

        this.startLoop()

        autorun(async () => {
            // const pointsGeometry = new THREE.BufferGeometry()
            pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(store.vertices, 3))
            pointsGeometry.attributes.position.needsUpdate = true
            pointsGeometry.computeBoundingSphere()
            this.cube.rotation.x += 40
            console.log(`store.vertices.length: ${store.vertices.length}`)
        })
    }

    stopLoop() {
        this.loopIsActive = false
    }

    startLoop() {
        if (this.loopIsActive)
            return
        this.loopIsActive = true
        this.loop()
    }

    resize(width = this.clientWidth, height = this.clientHeight) {
        const renderSize = this.renderer.getSize(new Vector2)
        if (renderSize.x === width && renderSize.y === height)
            return
        this.renderer.setSize(width, height)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
    }

    loop(timestamp: number = 0) {
        if (!this.loopIsActive)
            return
        this.resize()
        // this.cube.rotation.x += 0.1
        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(timestamp => this.loop(timestamp))
    }

    static get styles() {
        return css`
        :host {
            display: flex;
            width: 100%;
            height: 100%;
            align-items: stretch;
        }
        
        #canvas-3d{
            flex-grow: 1;
        }`
    }

    render() {
        return html`<canvas id='canvas-3d'></canvas>`
    }
}