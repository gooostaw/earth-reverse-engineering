import { store } from './store'

export async function startApp() {
    //jeśli jest taka potrzeba pobiera i odpala WebComponents polyfill
    if (!('registerElement' in document))
        await import('@webcomponents/webcomponentsjs')

    import(/* webpackMode: "eager" */ './app-window')
}

startApp()

let titleState = 0
setInterval(() => {
    titleState++
    const rotation = titleState % 3
    if (rotation === 0)
        return document.title = '🌎'
    else if (rotation === 1)
        return document.title = '🌍'
    else if (rotation === 2)
        return document.title = '🌏'
}, 1000)