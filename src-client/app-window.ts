import { LitElement, html, css, customElement } from 'lit-element'
import { store } from './store'
import { when } from 'mobx'
import { MobxLitElement } from '@adobe/lit-mobx'
import './map-element'
import { MapElement } from './map-element'
import './view-3d'
import { View3D } from './view-3d'

@customElement('app-window')
export class AppWindow extends MobxLitElement {
    mapElement: MapElement

    firstUpdated() {
        this.mapElement = this.shadowRoot.querySelector('mapElement') as MapElement
    }

    static get styles() {
        return css`
        :host {
            /* box-shadow: 0px 10px 35px -15px rgba(0,0,0,0.75); */
            color: white;
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: row;
        }
        
        #map-panel{
            display: flex;
            width: 50%;
            height: 100vh;

            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        #view-3d-panel{
            width: 50%;
            align-self: stretch;
        }

        map-element{
            width: 100%;
            flex-grow: 1;
        }
        
        #map-controls{
            width: 100%;
            height: 200px;
        }`
    }

    render() {
        return html`
            <div id="map-panel">
                <map-element></map-element>
                <div id="map-controls">
                    <div>${JSON.stringify(store.mapBox)}</div>
                    <div>${JSON.stringify(store.mapCenter)}</div>
                    <div>Zoom: ${store.mapZoom}</div>
                    <div>${JSON.stringify(store.misc)}</div>
                    <a href="data:${store.data}" download="data.json">download JSON</a>
                </div>
            </div>
            <div id="view-3d-panel">
                <view-3d></view-3d>
            </div>`
    }
}