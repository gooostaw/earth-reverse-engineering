import { observable, computed, action, autorun } from 'mobx'
import * as _ from 'lodash'
import { AppApi } from './app-api'
import { Box2, Vector2 } from 'three'

class Store {
    api = new AppApi()

    /** wiadomość do wyświetlenia */
    @observable
    message = {}

    // @observable
    // googleMapsReady = false

    @observable
    googleMapBounds: google.maps.LatLngBounds

    @observable
    googleMapCenter: google.maps.LatLng

    @observable
    googleMapZoom: number

    @computed
    get mapBox(): Box2 {
        if (!this.googleMapBounds)
            return new Box2(new Vector2(), new Vector2())

        const northEast = this.googleMapBounds.getNorthEast()
        const southWest = this.googleMapBounds.getSouthWest()

        return new Box2(new Vector2(southWest.lng(), southWest.lat()), new Vector2(northEast.lng(), northEast.lat()))
    }

    @computed
    get mapCenter(): Vector2 {
        if (!this.googleMapCenter)
            return new Vector2(0, 0)
        return new Vector2(this.googleMapCenter.lng(), this.googleMapCenter.lat())
    }

    @computed
    get mapZoom(): number {
        return this.googleMapZoom || 0
    }
}

export const store = new Store()

    ; (async () => console.log(await store.api.test('asdasd')))()

// window.addEventListener('resize', () => {
//     store.windowWidth = window.innerWidth;
// })

// autorun(() => console.log(`message: ${store.message}`))