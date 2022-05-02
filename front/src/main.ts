import { createApp } from "vue";
import App from "./App.vue";
import HelloWorld from "./components/HelloWorld.vue";
import Sidebar from "./components/Sidebar.vue";
import router from "./router";
import store from "./store";
import 'vue-universal-modal/dist/index.css'
import VueUniversalModal from 'vue-universal-modal'
// import axios from 'axios'

const app = createApp(App);
// app.provide('http', axios.create({
// 	baseURL: process.env.VUE_APP_API_ENDPOINT,
// 	withCredentials: true	
// }))

app.use(router);
app.use(store);
app.component("Sidebar", Sidebar);
// app.component("")
app.component("HelloWorld", HelloWorld);
app.use(VueUniversalModal, {
	teleportTarget: '#my-modals',
	modalComponent: 'MyModal',
})
app.mount("#app");
