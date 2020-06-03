import { LitElement, html, css, customElement } from 'lit-element'
import { store } from './store'
import { when } from 'mobx'
import { MobxLitElement } from '@adobe/lit-mobx'
import './map-element'
import { MapElement } from './map-element'

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
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            /* text-shadow: 0px 0px 7px rgba(255, 255, 255, 1); */
        }
        
        map-element{
            width: 100%;
            flex-grow: 1;
        }
        
        #panel{
            width: 100%;
            height: 100px;
        }`
    }

    render() {
        return html`
            <map-element></map-element>
            <div id='panel'>${JSON.stringify(store.mapBoundsArray)}</div>`
    }
}

//<script async defer src="https://maps.googleapis.com/maps/api/js?callback=initMap">