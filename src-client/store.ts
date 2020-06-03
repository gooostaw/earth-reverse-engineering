import { observable, computed, action, autorun } from 'mobx'
import * as _ from 'lodash'

type Bounds = {
    north: number,
    east: number,
    south: number,
    west: number
}

class Store {
    /** wiadomość do wyświetlenia */
    @observable
    message = {}

    /** wiadomość do wyświetlenia */
    @observable
    googleMapsReady = false

    @observable
    mapBounds: google.maps.LatLngBounds

    @computed get mapBoundsArray(): Bounds {
        if (!this.mapBounds)
            return { north: 0, east: 0, west: 0, south: 0 }

        const northEast = this.mapBounds.getNorthEast()
        const southWest = this.mapBounds.getSouthWest()

        return {
            north: northEast.lat(),
            east: northEast.lng(),
            west: southWest.lat(),
            south: southWest.lng()
        }
    }
}

export const store = new Store()

// window.addEventListener('resize', () => {
//     store.windowWidth = window.innerWidth;
// })

// autorun(() => console.log(`message: ${store.message}`))