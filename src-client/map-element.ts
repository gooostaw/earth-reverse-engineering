import { Loader, LoaderOptions } from 'google-maps'
import { LitElement, html, css, customElement } from 'lit-element'
import { store } from './store'
import { when, autorun } from 'mobx'
import { MobxLitElement } from '@adobe/lit-mobx'
import { MapNode } from '../utils/map-node'
import { Bulk } from '../utils/bulk'
import { earth } from './main'

@customElement('map-element')
export class MapElement extends MobxLitElement {
    mapDiv: HTMLDivElement
    map: google.maps.Map<HTMLDivElement>

    constructor() {
        super()
    }

    firstUpdated() {
        this.mapDiv = this.shadowRoot.getElementById('map') as HTMLDivElement
        this.initMap()
    }

    async initMap() {
        if (this.map || !this.mapDiv)
            return

        const loader = new Loader()
        const google = await loader.load()

        this.map = new google.maps.Map(this.mapDiv, {
            center: { lat: 0, lng: 0 },
            zoom: 2,
            mapTypeId: 'hybrid',
        })

        const updateMapParams = () => {
            store.googleMapBounds = this.map.getBounds()
            store.googleMapCenter = this.map.getCenter()
            store.googleMapZoom = this.map.getZoom()
        }

        updateMapParams()

        this.map.addListener('bounds_changed', updateMapParams)
        this.map.addListener('center_changed', updateMapParams)
        this.map.addListener('zoom_changed', updateMapParams)

        // const chunks = Chunk.generateChunks(5)

        // for (const chunk of chunks) {
        //     new google.maps.Rectangle({
        //         strokeColor: '#FFFFFF',
        //         strokeOpacity: 0.5,
        //         strokeWeight: 0.5,
        //         fillColor: chunk.color,
        //         fillOpacity: 0.5,
        //         map: this.map,
        //         bounds: chunk.getLatLngBounds()
        //     })

        //     // console.log(`${JSON.stringify(chunk.getBox())}`)
        //     // if (chunk.info !== undefined)
        //     new google.maps.Marker({
        //         position: chunk.getCenterLatLng(),
        //         icon: null,
        //         label: { text: chunk.id, fontWeight: 'bold', color: 'white' },
        //         map: this.map
        //     })
        // }


        // for (let i = 0; i < 7; i++) {
        //     console.log(`>>>>> LEVEL: ${i} <<<<<`)
        //     const rows = Chunk.getRows(i)
        //     const unitSize = Chunk.getUnitSize(i)
        //     console.log(`rows: ${rows}`)
        //     console.log(`unitSize: ${unitSize}`)
        //     for (let j = 0; j < rows; j++) {
        //         console.log(`row: ${j}/${rows}, widthUnits: ${Chunk.getWidthUnits(i, j)}`)
        //     }
        // }

        const rectangle = new google.maps.Rectangle({
            strokeColor: '#FFFF00',
            strokeOpacity: 1,
            strokeWeight: 1,
            fillColor: '#FFFFFF',
            fillOpacity: 0.05,
            map: this.map,
            bounds: {
                north: 33.685,
                south: 33.671,
                east: -116.234,
                west: -116.251
            }
        })

        const marker = new google.maps.Marker({
            // position: chunk.getCenterLatLng(),
            icon: null,
            // label: { text: '', fontWeight: 'bold', color: 'white' },
            map: this.map,
        })

        let currentChunkId = ''
        autorun(async () => {
            const mapNode = MapNode.fromCoords(earth, store.mapCenter.y, store.mapCenter.x, Math.max(store.mapZoom, 1))
            if (currentChunkId === mapNode.path)
                return
            currentChunkId = mapNode.path
            // store.misc['test'] = chunk.getRowNumber()
            rectangle.setBounds(mapNode.getLatLngBounds())
            marker.setPosition(mapNode.getCenterLatLng())
            marker.setLabel({ text: mapNode.path, fontWeight: 'bold', color: 'white' })
            console.log(`id: ${mapNode.path}`)
            await mapNode.load()
            // await chunk.loadMesh()
            // console.log(mapNode.mesh.data.kmlBoundingBox)
            // if(chunk.mesh && chunk.me)
            // const mesh = await chunk.loadMesh()
            // store.data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mesh))
            // console.log(JSON.stringify(message))
        })
    }

    static get styles() {
        return css`
        :host {
            display: flex;
            width: 100%;
            height: 100%;
            align-items: stretch;
        }
        
        #map{
            flex-grow: 1;
        }`
    }

    render() {
        return html`<div id='map'></div>`
    }
}