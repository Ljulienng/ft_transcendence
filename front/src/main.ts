import { createApp } from "vue";
import App from "./App.vue";
import HelloWorld from "./components/HelloWorld.vue";
import Sidebar from "./components/Sidebar.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
// import { use } from 'passport/lib'

const app = createApp(App);
app.use(router);
app.use(store);
app.component("Sidebar", Sidebar);
// app.component("")
app.component("HelloWorld", HelloWorld);
// Vue.prototype.axios = axios;
axios.defaults.baseURL = process.env.VUE_APP_API_ENDPOINT;
app.mount("#app");
