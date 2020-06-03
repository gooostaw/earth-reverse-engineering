import yargs from 'yargs'
import path from 'path'
import Koa from 'koa'
import koaStatic from 'koa-static'
import open from 'open'
import jetpack from 'fs-jetpack'

const port = yargs.argv.port || 11111
const app = new Koa()

console.log(jetpack.list(path.resolve(__dirname, 'public')))
app.use(koaStatic(path.resolve(__dirname, 'public')))

// app.use(async ctx => {
//     ctx.body = 'Hello World'
// })

app.listen(port)

console.log(`DEBUG: ${yargs.argv.debug}`)

if (!yargs.argv.debug) {
    open(`http://localhost:${port}`)
}