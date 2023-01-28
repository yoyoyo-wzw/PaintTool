import { App } from 'vue'
import _Painting from './painting/index'
import _Test from './test/index'

const components = [
    _Painting,
    _Test
]

const install = function(app: App) {
    components.forEach((component) => {
        app.component(component.name, component)
    })
}

export default {
    install,
    ...components
}
