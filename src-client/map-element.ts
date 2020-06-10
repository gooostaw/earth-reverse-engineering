import { LitElement, html, css, customElement } from 'lit-element'
import { store } from './store'
import { when } from 'mobx'
import { MobxLitElement } from '@adobe/lit-mobx'

@customElement('map-element')
export class MapElement extends MobxLitElement {
    mapDiv: HTMLDivElement
    map: google.maps.Map<HTMLDivElement>

    constructor() {
        super()
    }

    firstUpdated() {
        this.mapDiv = this.shadowRoot.getElementById('map') as HTMLDivElement
        when(() => store.googleMapsReady, () => this.initMap())
    }

    initMap() {
        if (this.map || !this.mapDiv)
            return

        this.map = new window.google.maps.Map(this.mapDiv, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
            mapTypeId: 'satellite',
        })

        var rectangle = new google.maps.Rectangle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: this.map,
            bounds: {
                north: 33.685,
                south: 33.671,
                east: -116.234,
                west: -116.251
            }
        })

        store.mapBounds = this.map.getBounds()

        this.map.addListener('bounds_changed', () => {
            store.mapBounds = this.map.getBounds()
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