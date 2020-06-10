import { Api } from './api'

export class AppApi extends Api {
    async test(value = 'samochodem'): Promise<string> {
        return await this.fetch('f', [value])
    }
}