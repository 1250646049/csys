import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from "./store"
import "./router/routerBefore"
import mitt from "mitt"
import "@arco-design/web-vue/dist/arco.css";
import nocover from "./assets/img/loading.gif"
//引入图片懒加载插件
import Lazyload from "vue3-lazyload";
const app = createApp(App)
app.use(router).use(store)
app.use(Lazyload,{
    loading:nocover,
    error:nocover,
})
// 挂载全局事件总线
app.config.globalProperties.$mitt=new mitt()
// 处理告警数据
app.config.warnHandler=function(){
    
}
app.mount('#app')
