import { Box2, Vector2 } from 'three'
import { google } from 'google-maps'
import { Mesh } from './mesh'

export interface ChunkOptions {
    level?: number
    x?: number
    y?: number
    id?: string
    color?: string
    info?: string
}

export class Chunk {
    level: number
    x: number
    y: number
    id: string
    color: string
    info?: string
    mesh?: Mesh

    constructor(options: ChunkOptions = {}) {
        let { info, level = 2, x = 0, y = 0, id = '' } = options

        if (level < 2)
            throw new Error('minimal Chunk level is 2')

        this.level = level
        this.x = x
        this.y = y
        this.id = Chunk.prepareId(id)
        this.info = info

        this.color = options.color

        if (!this.color)
            this.compColor()
    }

    compColor() {
        this.color = 'blue'//`rgb(${(this.box.min.x + 180) / 360 * 255}, ${(this.box.min.y + 90) / 180 * 255}, 0)`
    }

    async loadMesh(force = false) {
        if (!this.mesh || force) {
            this.mesh = new Mesh(this.id)
            await this.mesh.load()
        }
        return this.mesh
    }

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
        const rows = Chunk.getRows(level)
        const rowsHalf = rows / 2
        const rowFromCenter = y < rowsHalf ? y : -y + rows - 1
        return 1 << (31 - Math.clz32(rowsHalf / (rowFromCenter + 1)))
    }

    /** Zwraca ilość jednostek jakie musie mieć chunk na szerokość */
    getWidthUnits() {
        return Chunk.getWidthUnits(this.level, this.y)
    }

    /** Zwraca ilość rzędów dla danego poziomu */
    static getRows(level: number) {
        return 2 ** (level - 1)
    }

    /** Zwraca ilość rzędów dla poziomu fragmentu*/
    getRows() {
        return Chunk.getRows(this.level)
    }

    /** Zwraca rozmiar jednostki dla danego poziomu */
    static getUnitSize(level: number) {
        return 360 / 2 ** level
    }

    /** Zwraca rozmiar jednostki dla poziomu fragmentu */
    getUnitSize() {
        return Chunk.getUnitSize(this.level)
    }

    clone() {
        return new Chunk({
            level: this.level,
            x: this.x,
            y: this.y,
            id: this.id,
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

    getSubChunks(): Chunk[] {
        const subChunks = []
        const widthUnits = this.getWidthUnits()
        // const subUnitSize = Chunk.getUnitSize(this.level + 1)
        // const widthUnitSize = Chunk.getWidthUnits(this.level + 1)

        const bottomLeftChunk = new Chunk({
            level: this.level + 1,
            y: this.y * 2,
            id: this.id + '0'
        })
        subChunks.push(bottomLeftChunk)

        if (bottomLeftChunk.getWidthUnits() === widthUnits * 2) {
            bottomLeftChunk.x = this.x
        }
        else {
            bottomLeftChunk.x = this.x * 2
            const bottomRightChunk = new Chunk({
                level: this.level + 1,
                x: this.x * 2 + 1,
                y: this.y * 2,
                id: this.id + '1'
            })
            subChunks.push(bottomRightChunk)
        }

        const topLeftChunk = new Chunk({
            level: this.level + 1,
            y: this.y * 2 + 1,
            id: this.id + '2'
        })
        subChunks.push(topLeftChunk)

        if (topLeftChunk.getWidthUnits() == widthUnits * 2) {
            topLeftChunk.x = this.x
        }
        else {
            topLeftChunk.x = this.x * 2
            const topRightChunk = new Chunk({
                level: this.level + 1,
                x: this.x * 2 + 1,
                y: this.y * 2 + 1,
                id: this.id + '3'
            })
            subChunks.push(topRightChunk)
        }

        return subChunks
    }

    static fromCoords(lat: number, long: number, level: number) {
        const coordPoint = new Vector2(long, lat)
        let currentsChunks = Chunk.generateBasicChunks()

        function findChunkWithPoint(chunks: Chunk[], point: Vector2 = coordPoint) {
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

    static prepareId(id: string) {
        return id.split('').map((digit, i) => {
            const int = parseInt(digit)
            if (i > 1 && int < 4 && i % 2 === 0)
                return (parseInt(digit) + 4).toString()
            return digit
        }).join('')
    }

    static generateBasicChunks(): Chunk[] {
        return [
            new Chunk({ level: 2, x: 0, y: 0, id: '02' }),
            new Chunk({ level: 2, x: 1, y: 0, id: '03' }),
            new Chunk({ level: 2, x: 2, y: 0, id: '12' }),
            new Chunk({ level: 2, x: 3, y: 0, id: '13' }),
            new Chunk({ level: 2, x: 0, y: 1, id: '20' }),
            new Chunk({ level: 2, x: 1, y: 1, id: '21' }),
            new Chunk({ level: 2, x: 2, y: 1, id: '30' }),
            new Chunk({ level: 2, x: 3, y: 1, id: '31' }),
        ]
    }

    static generateChunks(level: number = 3): Chunk[] {
        if (level < 2)
            throw new Error('minimal Chunk level is 2')

        let chunks = Chunk.generateBasicChunks()

        for (let currentLevel = 2; currentLevel < level; currentLevel++) {
            const newChunks: Chunk[] = []
            for (let oldChunk of chunks)
                newChunks.push(...oldChunk.getSubChunks())
            chunks = newChunks
        }

        console.log(`chunks.length: ${chunks.length}`)
        return chunks
    }
}