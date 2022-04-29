import { createApp } from 'vue'
import App from './App.vue'
import HelloWorld from './components/HelloWorld.vue'
import Sidebar from './components/Sidebar.vue'
import router from './router'
import './assets/css/style.scss'
// import { use } from 'passport/lib'

const app = createApp(App)
app.use(router)
app.component("Sidebar", Sidebar)
// app.component("")
app.component("HelloWorld", HelloWorld)
app.mount("#app")

