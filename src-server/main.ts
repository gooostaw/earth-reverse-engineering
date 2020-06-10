import _ from 'lodash-es'
import yargs from 'yargs'
import path from 'path'
import Koa from 'koa'
import koaStatic from 'koa-static'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import open from 'open'
import jetpack from 'fs-jetpack'

const port = yargs.argv.port || 11111
const app = new Koa()
const router = new Router()

app.use(koaStatic(path.resolve(__dirname, 'public')))

app.use(async (ctx, next) => {
    try {
        ctx.type = 'application/json'
        ctx.status = 200
        await next()
    } catch (err) {
        ctx.status = err.statusCode || 500

        ctx.body = {}

        for (const [key, value] of Object.entries(err))
            if (key !== 'stack')
                ctx.body[key] = value

        ctx.body.message = err.message || 'unkonown error'
        ctx.type = 'application/json'
    }
})

app.use(bodyParser({ strict: false }))
app.use(router.routes())

const api = {
    qwe: 123,
    asd: [1, 2, 3],
    zxc: { rty: 'ojej' },
    f: (value = 'kioskiem') => `ranyboskie jestem ${value}`
}

router.all('/api/:command*', async ctx => {
    const params = ctx.params
    const requestBody = ctx.request.body
    if (params.command) {
        console.log(`command: ${params.command}`)

        if (ctx.method === 'PUT') {
            _.set(api, params.command, requestBody)
        }
        else {
            const apiItem = _.get(api, params.command)
            let value: any

            if (_.isFunction(apiItem)) {
                if (_.isArray(requestBody))
                    value = await apiItem(...requestBody)
                else
                    value = await apiItem()
            }
            else {
                value = apiItem
            }

            console.log(`value: ${value}`)
            ctx.body = value
        }
    }
})

app.listen(port)

console.log(`DEBUG: ${yargs.argv.debug}`)

if (!yargs.argv.debug) {
    open(`http://localhost:${port}`)
}