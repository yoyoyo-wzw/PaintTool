import { App } from 'vue'

import main from './main.vue'

main.install = function(app:App) {
    app.component(main.name, main)
}

export default main

