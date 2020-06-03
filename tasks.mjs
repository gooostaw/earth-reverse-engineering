import yargs from 'yargs'
import spawn from 'cross-spawn'

async function run(command, args, options = {}) {
    options = Object.assign({}, { stdio: 'inherit' }, options)
    const process = spawn(command, args, { stdio: 'inherit' })

    return new Promise((resolve, reject) => {
        process.on('close', code => {
            if (code === 0)
                resolve(code)
            else
                reject(code)
        })
    })
}

const build = async () => {
    await run('yarn', ['build-dist'])
    await run('yarn', ['build-web'])
    await run('yarn', ['build-bin'])
}

const start = async () => {
    // await run('yarn', ['build-web'])
    await Promise.all([
        run('yarn', ['start-server']),
        run('yarn', ['start-client'])
    ])
}

async function startTasks() {
    if (yargs.argv.build)
        await build()
    if (yargs.argv.start)
        await start()
}

startTasks()