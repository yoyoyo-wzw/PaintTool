/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue';

    // const vueComponent: {
    //     name?: string,
    //     install?: PluginInstallFunction,
    //     [P in keyof (DefineComponent<{}, {}, any>)] :DefineComponent<{}, {}, any>[P]
    // };
    const vueComponent: DefineComponent<{}, {}, any>;

    export default vueComponent;
}
