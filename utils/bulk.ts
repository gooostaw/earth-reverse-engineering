import protobuf from 'protobufjs'
import { Planetoid, NodeMeta as NodeMeta } from './planetoid'
import { MapNode } from './map-node'

//@ts-ignore
import protoSource from '../proto/rocktree.proto'

const bulkMetadataType = protobuf.parse(protoSource).root.lookupType("BulkMetadata")

export class Bulk {
    loaded = false
    planetoid: Planetoid
    path: string
    data: any
    nodesInfo: { [key: string]: NodeMeta } = {}

    constructor(planetoid: Planetoid, path: string) {
        this.planetoid = planetoid
        this.path = Bulk.prepareBulkPath(path)
    }

    async load() {
        if (this.loaded)
            return
        const response = await fetch(`${this.planetoid.url}BulkMetadata/pb=!1m2!1s${this.path}!2u${this.planetoid.epoch}`)
        const buffer = new Uint8Array(await response.arrayBuffer())
        const data = bulkMetadataType.decode(buffer) as any
        this.data = data

        const defaultEpoch = data.headNodeKey.epoch
        const defaultImgEpoch = data.defaultImageryEpoch
        const defaultTexFormat = data.defaultAvailableTextureFormats

        for (const nodeMeta of data.nodeMetadata) {
            let temp = nodeMeta.pathAndFlags

            //decode level
            const level = temp & 0b11
            temp >>= 2

            //decode path
            let path = this.path //set base path

            for (let i = 0; i <= level; i++) {
                path += (temp & 0b111) //decode in bulk path digits
                temp >>= 3
            }

            this.nodesInfo[path] = {
                path,
                epoch: nodeMeta.epoch || defaultEpoch,
                imgEpoch: nodeMeta.imageryEpoch || defaultImgEpoch,
                texFormat: nodeMeta.availableTextureFormats || defaultTexFormat
            }
        }

        this.loaded = true
    }

    static prepareBulkPath(nodePath: string = '') {
        return nodePath.substring(0, Math.floor(nodePath.length / 4) * 4)
    }
}