import protobuf from 'protobufjs'
//@ts-ignore
import protoSource from '../proto/rocktree.proto'

const NodeData = protobuf.parse(protoSource).root.lookupType("NodeData")

//const url = `!1m2!1s${path}!2u${nodeEpoch}!2e${nodeTexFormat}${imgEpochPart}!4b0`
//https://kh.google.com/rt/earth/NodeData/pb=!1m2!1s03!2u869!2e1!3u844!4b0
//https://kh.google.com/rt/earth/NodeData/pb=!1m2!1s20527060725!2u867!2e1!3u837!4b0

export class Mesh {
    chunkId: string
    url: string
    data

    constructor(chunkId) {
        this.chunkId = chunkId
        this.url = `https://kh.google.com/rt/earth/NodeData/pb=!1m2!1s${chunkId}!2u869!2e1!3u844!4b0`
    }

    async load() {
        const response = await fetch(this.url)
        const buffer = new Uint8Array(await response.arrayBuffer())
        this.data = NodeData.decode(buffer)
    }
}