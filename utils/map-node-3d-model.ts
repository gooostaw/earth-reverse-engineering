import protobuf from 'protobufjs'

import { Planetoid, NodeMeta } from './planetoid'

//@ts-ignore
import protoSource from '../proto/rocktree.proto'

const nodeDataType = protobuf.parse(protoSource).root.lookupType("NodeData")
const meshType = protobuf.parse(protoSource).root.lookupType("Mesh")

export class MapNode3dModel {
    planetoid: Planetoid
    nodeMeta: NodeMeta
    loaded = false
    data

    constructor(planetoid: Planetoid, nodeMeta: NodeMeta) {
        this.planetoid = planetoid
        this.nodeMeta = nodeMeta
    }

    async load() {
        if (this.loaded)
            return
        const { path, epoch, imgEpoch, texFormat } = this.nodeMeta
        const url = `${this.planetoid.url}NodeData/pb=!1m2!1s${path}!2u${epoch}!2e${texFormat}!3u${imgEpoch}!4b0`

        const response = await fetch(url)
        if (!response.ok)
            throw new Error(`MapNodeMesh load error: ${response.status}`)

        const buffer = new Uint8Array(await response.arrayBuffer())
        this.data = nodeDataType.decode(buffer)

        // const meshesData = this.data.meshes

        // const firstMesh = meshesData[0]

        // if(firstMesh){
        //     console.log(firstMesh)
        // }
        // const verts = meshType.decode(this.data)
        // console.log(JSON.stringify(this.data, null, 2))

        this.loaded = true
    }
}