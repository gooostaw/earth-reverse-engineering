import { store } from './store'

export async function startApp() {
    //jeśli jest taka potrzeba pobiera i odpala WebComponents polyfill
    if (!('registerElement' in document))
        await import('@webcomponents/webcomponentsjs')

    import(/* webpackMode: "eager" */ './app-window')
}

startApp();

(window as any).initMap = () => {
    console.log('window.initMap')
    store.googleMapsReady = true
}