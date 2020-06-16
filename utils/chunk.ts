import { Box2, Vector2 } from 'three'
import { google } from 'google-maps'

export class Chunk {
    readonly box: Box2
    readonly id: string

    constructor(box: Box2, id: string) {
        this.box = box
        this.id = id
    }

    getLatLngBounds(): google.maps.LatLngBounds {
        return new google.maps.LatLngBounds({lng: this.box.min.x, lat: this.box.min.y}, {lng: this.box.max.x, lat: this.box.max.y})
    }

    static fromCoords(lat: number, long: number, level: number) {
        const box = new Box2(new Vector2(-180, -180), new Vector2(180, 180))
        let id = '0'

        for (let i = 0; i < level; i++) {
            const center = new Vector2()
            box.getCenter(center)
            if (lat < center.y) {
                if (long < center.x) {
                    id += '0'
                    box.max.x = center.x
                    box.max.y = center.y
                }
                else {
                    id += '1'
                    box.min.x = center.x
                    box.max.y = center.y
                }
            }
            else {
                if (long < center.x) {
                    id += '2'
                    box.max.x = center.x
                    box.min.y = center.y
                }
                else {
                    id += '3'
                    box.min.x = center.x
                    box.min.y = center.y
                }
            }
        }

        return new Chunk(box, id)
    }
}