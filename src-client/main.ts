import { store } from './store'

async function loadGoogleMapsScript(src = 'https://maps.googleapis.com/maps/api/js?callback=initMap') {
    return new Promise(resolve => {
        (window as any).initMap = () => store.googleMapsReady = true

        const googleMapsScriptElement = document.createElement('script')
        googleMapsScriptElement.onload = resolve
        googleMapsScriptElement.setAttribute('src', src)
        document.head.appendChild(googleMapsScriptElement);
    })
}

export async function startApp() {
    await loadGoogleMapsScript()

    //jeśli jest taka potrzeba pobiera i odpala WebComponents polyfill
    if (!('registerElement' in document))
        await import('@webcomponents/webcomponentsjs')

    import(/* webpackMode: "eager" */ './app-window')
}

startApp()