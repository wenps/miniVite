// 对于这种vue，浏览器是无法识别的，因此需要将vue转换成相对地址
import { createApp, h } from '/@modules/vue' // 这里是手动加标识，如果遇到这个标识就去node_modules里面找
import App from './App.vue'

createApp(
    App
    // {
    //     render() {
    //         return h('div', {name: 'xiaoshan'}, [h('div', 'xx'), h('div', 'xx')])
    //     }
    // }
).mount('#app')
