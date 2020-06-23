import { Bulk } from './bulk'

import protobuf from 'protobufjs'
//@ts-ignore
import protoSource from '../proto/rocktree.proto'

const planetoidMetadataType = protobuf.parse(protoSource).root.lookupType("PlanetoidMetadata")

export interface NodeMeta {
    epoch: number
    imgEpoch: number
    texFormat: number
    path: string
}

export class Planetoid {
    loaded = false
    url: string
    radius: number
    epoch: number
    bulkMetadataEpoch: number
    data: any
    nodesInfo: { [key: string]: NodeMeta } = {}

    constructor(url: string = `https://kh.google.com/rt/earth/`) {
        this.url = url
    }

    async load() {
        if (this.loaded)
            return
        const response = await fetch(this.url + 'PlanetoidMetadata')
        const buffer = new Uint8Array(await response.arrayBuffer())
        const data = planetoidMetadataType.decode(buffer) as any
        this.data = data
        this.radius = data.radius
        this.epoch = data.rootNodeMetadata.epoch
        this.bulkMetadataEpoch = data.rootNodeMetadata.bulkMetadataEpoch
        this.loaded = true
        // console.log(`Planetoid.data : ${JSON.stringify(this.data, null, 2)}`)
    }

    async loadNodesMetaFromPath(path: string) {
        const bulk = new Bulk(this, path)
        await bulk.load()
        this.nodesInfo = Object.assign(this.nodesInfo, bulk.nodesInfo)
    }

    async getNodeMeta(path: string) {
        let nodeMeta = this.nodesInfo[path]

        if (!nodeMeta) {
            await this.loadNodesMetaFromPath(path)
            nodeMeta = this.nodesInfo[path]
        }

        return nodeMeta
    }
}