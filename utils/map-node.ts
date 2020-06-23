import { Box2, Vector2 } from 'three'
import { google } from 'google-maps'
import { Planetoid } from './planetoid'
import { MapNodeMesh } from './map-node-mesh'
import { Bulk } from './bulk'

export interface MapNodeOptions {
    level?: number
    x?: number
    y?: number
    path?: string
    color?: string
    info?: string
}

export class MapNode {
    loaded = false
    planetoid: Planetoid
    level: number
    x: number
    y: number
    path: string
    color: string
    info?: string
    mesh?: MapNodeMesh

    constructor(planetoid: Planetoid, options: MapNodeOptions = {}) {
        let { info, level = 2, x = 0, y = 0, path = '' } = options

        if (level < 2)
            throw new Error('minimal Chunk level is 2')

        this.planetoid = planetoid
        this.level = level
        this.x = x
        this.y = y
        this.path = MapNode.preparePath(path)
        this.info = info

        this.color = options.color

        if (!this.color)
            this.compColor()
    }

    compColor() {
        this.color = 'blue'//`rgb(${(this.box.min.x + 180) / 360 * 255}, ${(this.box.min.y + 90) / 180 * 255}, 0)`
    }

    async load() {
        const bulk = await Bulk.fromMapNode(this)
        const possibleEpochs = bulk.getPossibleEpochs()
        console.log(`node path: ${this.path}`)
        console.log(`bulk length: ${bulk.data.nodeMetadata.length}`)
        // console.log(`possibleEpochs: ${JSON.stringify(possibleEpochs, null, 2)}`)
        // console.log(JSON.stringify(bulk.data, null, 2))
        const arr = []
        for (const meta of bulk.data.nodeMetadata) {
            arr.push({
                pathAndFlags: meta.pathAndFlags,
                path_4: meta.pathAndFlags >> 4,
                path_5: meta.pathAndFlags >> 5,
                path_6: meta.pathAndFlags >> 6,
                path_7: meta.pathAndFlags >> 7,
                path_8: meta.pathAndFlags >> 8,
                path_9: meta.pathAndFlags >> 9
            })
        }

        console.log(JSON.stringify(arr, null, 2))

        // const headNodeKey = bulk.data.headNodeKey
        // console.log(`headNodeKey: ${JSON.stringify(headNodeKey, null, 2)}`)
        this.mesh = new MapNodeMesh(this)
        await this.mesh.load(possibleEpochs)
        // this.loaded = true
        console.log(JSON.stringify(this.mesh.data.kmlBoundingBox, null, 2))
    }

    // async loadMesh(force = false) {
    //     if (!this.mesh || force) {
    //         this.mesh = new MapNodeMesh(this.path)
    //         await this.mesh.load()
    //     }
    //     return this.mesh
    // }

    getBox() {
        const unitSize = this.getUnitSize()
        const widthUnits = this.getWidthUnits()
        return new Box2(
            new Vector2(this.x * unitSize * widthUnits - 180, this.y * unitSize - 90),
            new Vector2((this.x + 1) * unitSize * widthUnits - 180, (this.y + 1) * unitSize - 90)
        )
    }

    /** Zwraca ilość jednostek jakie musie mieć chunk na szerokość w na danym poziomie w danym rzędzie*/
    static getWidthUnits(level: number, y: number) {
        if (level < 2)
            return 1
        const rows = MapNode.getRows(level)
        const rowsHalf = rows / 2
        const rowFromCenter = y < rowsHalf ? y : -y + rows - 1
        return 1 << (31 - Math.clz32(rowsHalf / (rowFromCenter + 1)))
    }

    /** Zwraca ilość jednostek jakie musie mieć chunk na szerokość */
    getWidthUnits() {
        return MapNode.getWidthUnits(this.level, this.y)
    }

    /** Zwraca ilość rzędów dla danego poziomu */
    static getRows(level: number) {
        return 2 ** (level - 1)
    }

    /** Zwraca ilość rzędów dla poziomu fragmentu*/
    getRows() {
        return MapNode.getRows(this.level)
    }

    /** Zwraca rozmiar jednostki dla danego poziomu */
    static getUnitSize(level: number) {
        return 360 / 2 ** level
    }

    /** Zwraca rozmiar jednostki dla poziomu fragmentu */
    getUnitSize() {
        return MapNode.getUnitSize(this.level)
    }

    clone() {
        return new MapNode(this.planetoid, {
            level: this.level,
            x: this.x,
            y: this.y,
            path: this.path,
            color: this.color,
            info: Object.assign({}, this.info)
        })
    }

    getCenter() {
        const center = new Vector2()
        this.getBox().getCenter(center)
        return center
    }

    getCenterLatLng() {
        const center = this.getCenter()
        return new google.maps.LatLng(center.y, center.x)
    }

    getLatLngBounds(): google.maps.LatLngBounds {
        const box = this.getBox()
        return new google.maps.LatLngBounds({ lng: box.min.x, lat: box.min.y }, { lng: box.max.x, lat: box.max.y })
    }

    getSubChunks(): MapNode[] {
        const subChunks = []
        const widthUnits = this.getWidthUnits()
        // const subUnitSize = Chunk.getUnitSize(this.level + 1)
        // const widthUnitSize = Chunk.getWidthUnits(this.level + 1)

        const bottomLeftChunk = new MapNode(this.planetoid, {
            level: this.level + 1,
            y: this.y * 2,
            path: this.path + '0'
        })
        subChunks.push(bottomLeftChunk)

        if (bottomLeftChunk.getWidthUnits() === widthUnits * 2) {
            bottomLeftChunk.x = this.x
        }
        else {
            bottomLeftChunk.x = this.x * 2
            const bottomRightChunk = new MapNode(this.planetoid, {
                level: this.level + 1,
                x: this.x * 2 + 1,
                y: this.y * 2,
                path: this.path + '1'
            })
            subChunks.push(bottomRightChunk)
        }

        const topLeftChunk = new MapNode(this.planetoid, {
            level: this.level + 1,
            y: this.y * 2 + 1,
            path: this.path + '2'
        })
        subChunks.push(topLeftChunk)

        if (topLeftChunk.getWidthUnits() == widthUnits * 2) {
            topLeftChunk.x = this.x
        }
        else {
            topLeftChunk.x = this.x * 2
            const topRightChunk = new MapNode(this.planetoid, {
                level: this.level + 1,
                x: this.x * 2 + 1,
                y: this.y * 2 + 1,
                path: this.path + '3'
            })
            subChunks.push(topRightChunk)
        }

        return subChunks
    }

    static fromCoords(planetoid: Planetoid, lat: number, long: number, level: number) {
        const coordPoint = new Vector2(long, lat)
        let currentsChunks = MapNode.generateBasicChunks(planetoid)

        function findChunkWithPoint(chunks: MapNode[], point: Vector2 = coordPoint) {
            for (const chunk of chunks)
                if (chunk.getBox().containsPoint(point))
                    return chunk

            throw new Error('Chunk not found. Invalid coords')
        }

        while (true) {
            const newChunk = findChunkWithPoint(currentsChunks)
            if (newChunk.level >= level)
                return newChunk
            currentsChunks = newChunk.getSubChunks()
        }

        // let currentChunk = new Chunk()

        // const box = new Box2(new Vector2(-180, -180), new Vector2(180, 180))
        // let id = '0'

        // for (let i = 0; i < level; i++) {
        //     const center = new Vector2()
        //     box.getCenter(center)
        //     if (lat < center.y) {
        //         if (long < center.x) {
        //             id += '0'
        //             box.max.x = center.x
        //             box.max.y = center.y
        //         }
        //         else {
        //             id += '1'
        //             box.min.x = center.x
        //             box.max.y = center.y
        //         }
        //     }
        //     else {
        //         if (long < center.x) {
        //             id += '2'
        //             box.max.x = center.x
        //             box.min.y = center.y
        //         }
        //         else {
        //             id += '3'
        //             box.min.x = center.x
        //             box.min.y = center.y
        //         }
        //     }
        // }

        // return new Chunk({ box })
    }

    static preparePath(path: string) {
        return path.split('').map((digit, i) => {
            const int = parseInt(digit)
            if (i > 1 && int < 4 && i % 2 === 0)
                return (parseInt(digit) + 4).toString()
            return digit
        }).join('')
    }

    static generateBasicChunks(planetoid: Planetoid): MapNode[] {
        return [
            new MapNode(planetoid, { level: 2, x: 0, y: 0, path: '02' }),
            new MapNode(planetoid, { level: 2, x: 1, y: 0, path: '03' }),
            new MapNode(planetoid, { level: 2, x: 2, y: 0, path: '12' }),
            new MapNode(planetoid, { level: 2, x: 3, y: 0, path: '13' }),
            new MapNode(planetoid, { level: 2, x: 0, y: 1, path: '20' }),
            new MapNode(planetoid, { level: 2, x: 1, y: 1, path: '21' }),
            new MapNode(planetoid, { level: 2, x: 2, y: 1, path: '30' }),
            new MapNode(planetoid, { level: 2, x: 3, y: 1, path: '31' }),
        ]
    }

    static generateChunks(planetoid: Planetoid, level: number = 3): MapNode[] {
        if (level < 2)
            throw new Error('minimal Chunk level is 2')

        let chunks = MapNode.generateBasicChunks(planetoid)

        for (let currentLevel = 2; currentLevel < level; currentLevel++) {
            const newChunks: MapNode[] = []
            for (let oldChunk of chunks)
                newChunks.push(...oldChunk.getSubChunks())
            chunks = newChunks
        }

        console.log(`chunks.length: ${chunks.length}`)
        return chunks
    }
}