
export interface ApiOptions {
    apiUrl?: string
}

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATH'

export class Api {
    apiUrl: string

    constructor(options: ApiOptions = {}) {
        const { apiUrl = `${window.location.origin}/api` } = options
        this.apiUrl = apiUrl
    }

    async fetch(path: string, data: any[] = [], method: HttpMethod = 'POST') {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const response = await fetch(`${this.apiUrl}/${path}`, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            redirect: 'follow'
        })

        return await response.text()
    }
}