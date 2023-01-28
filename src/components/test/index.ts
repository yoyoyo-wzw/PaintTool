import { App } from 'vue'

import main from './main.vue'

// 用于全局注册
main.install = function(app:App) {
    app.component(main.name, main)
}

// 用于局部注册
export default main

