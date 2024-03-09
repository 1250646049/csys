import { createPinia } from 'pinia'
import persistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(persistedstate)

export * from './setting'
export * from './history'
export default pinia
