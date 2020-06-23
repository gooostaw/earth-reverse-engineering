import protobuf from 'protobufjs'
import { Planetoid } from './planetoid'
import { MapNode } from './map-node'

//@ts-ignore
import protoSource from '../proto/rocktree.proto'

const bulkMetadataType = protobuf.parse(protoSource).root.lookupType("BulkMetadata")

export class Bulk {
    loaded = false
    planetoid: Planetoid
    path: string
    data: any
    // index: number

    constructor(planetoid: Planetoid, path: string) {
        this.planetoid = planetoid
        this.path = Bulk.prepareBulkPath(path)
    }

    async load() {
        const response = await fetch(`${this.planetoid.url}BulkMetadata/pb=!1m2!1s${this.path}!2u${this.planetoid.epoch}`)
        const buffer = new Uint8Array(await response.arrayBuffer())
        this.data = bulkMetadataType.decode(buffer) as any
        // this.index = this.getIndexByPath(this.path)
        this.loaded = true
    }

    // getIndexByPath(path: string): number {
    //     let c = -1
    //     for (let e = path, f = (e.length - 1) - ((e.length - 1) % 4); f < e.length; ++f)
    //         c = this.data.childIndices[8 * (c + 1) + (e.charCodeAt(f) - 48)]
    //     return c
    // }

    // hasBulkMetadataAtIndex(index: number) {
    //     return !!(this.data.flags[index] & 4)
    // }

    // hasNodeAtIndex(index: number) {
    //     return !(this.data.flags[index] & 8);
    // }

    static prepareBulkPath(nodePath: string = '') {
        return nodePath.substring(0, Math.floor(nodePath.length / 4) * 4)
    }

    getPossibleEpochs(): number[] {
        const epochs = []

        if (this.data && this.data.nodeMetadata) {
            const nodeMetadata = this.data.nodeMetadata
            for (const metaData of nodeMetadata) {
                const epoch = metaData.epoch
                if (epoch && !epochs.includes(epoch))
                    epochs.push(epoch)
            }
        }

        return epochs
    }

    static async fromMapNode(mapNode: MapNode) {
        const bulk = new Bulk(mapNode.planetoid, mapNode.path)
        await bulk.load()
        return bulk
    }
}