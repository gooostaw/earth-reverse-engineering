import { Loader, LoaderOptions } from 'google-maps'
import { LitElement, html, css, customElement } from 'lit-element'
import { store } from './store'
import { when, autorun } from 'mobx'
import { MobxLitElement } from '@adobe/lit-mobx'
import { Chunk } from '../utils/chunk'

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
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
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

        autorun(() => {
            const chunk = Chunk.fromCoords(store.mapCenter.y, store.mapCenter.x, Math.max(store.mapZoom, 1))
            rectangle.setBounds(chunk.getLatLngBounds())
            // rectangle.setBounds({ north: store.mapCenter.y, east: store.mapCenter.x + 10, south: store.mapCenter.y - 10, west: store.mapCenter.x })
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