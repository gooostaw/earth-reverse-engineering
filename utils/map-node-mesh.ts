import protobuf from 'protobufjs'

import { MapNode } from './map-node'

//@ts-ignore
import protoSource from '../proto/rocktree.proto'

const nodeDataType = protobuf.parse(protoSource).root.lookupType("NodeData")

//const url = `!1m2!1s${path}!2u${nodeEpoch}!2e${nodeTexFormat}${imgEpochPart}!4b0`
//https://kh.google.com/rt/earth/NodeData/pb=!1m2!1s03!2u869!2e1!3u844!4b0
//https://kh.google.com/rt/earth/NodeData/pb=!1m2!1s20527060725!2u867!2e1!3u837!4b0

export class MapNodeMesh {
    mapNode: MapNode
    loaded = false
    data

    constructor(mapNode: MapNode) {
        this.mapNode = mapNode
        //this.url = `${}NodeData/pb=!1m2!1s${chunkId}!2u869!2e1!3u844!4b0`
    }

    async load(possibleEpochs: number[]) {
        if (!possibleEpochs.length)
            throw new Error(`MapNodeMesh load error: no possible epochs`)
        const { planetoid, path } = this.mapNode
        let response: Response
        for (const epoch of possibleEpochs) {
            response = await fetch(`${planetoid.url}NodeData/pb=!1m2!1s${path}!2u${epoch}!2e1!3u844!4b0`)
            if (response.ok)
                break
        }

        if (!response.ok)
            throw new Error(`MapNodeMesh load error: ${response.status}`)

        const buffer = new Uint8Array(await response.arrayBuffer())
        this.data = nodeDataType.decode(buffer)
        this.loaded = true
    }
}