import protobuf from 'protobufjs'
//@ts-ignore
import protoSource from '../proto/rocktree.proto'

const planetoidMetadataType = protobuf.parse(protoSource).root.lookupType("PlanetoidMetadata")

export class Planetoid {
    loaded = false
    url: string
    radius: number
    epoch: number
    bulkMetadataEpoch: number
    data: any

    constructor(url: string = `https://kh.google.com/rt/earth/`) {
        this.url = url
    }

    async load() {
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
}