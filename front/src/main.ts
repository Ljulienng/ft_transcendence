import { createApp } from "vue";
import App from "./App.vue";
import HelloWorld from "./components/HelloWorld.vue";
import Sidebar from "./components/Sidebar.vue";
import UploadAvatar from "./components/UploadAvatar.vue"
import ChatTests from "./components/ChatTests.vue"
import frontChatTests from "./components/frontChatTests.vue"
import router from "./router";
import store from "./store";
import 'vue-universal-modal/dist/index.css'
import VueUniversalModal from 'vue-universal-modal'
import Notifications from '@kyvg/vue3-notification'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import ToggleSwitch from '../node_modules/vuejs-toggle-switch/src/components/ToggleSwitch.vue'
// import axios from 'axios'

const app = createApp(App);
app.use(router);
app.config.globalProperties.$store = store;
app.use(store);
app.component("Sidebar", Sidebar);
app.component("UploadAvatar", UploadAvatar);
app.use(Notifications);
app.component("HelloWorld", HelloWorld);
app.component("ChatTests", ChatTests);
app.component("frontChatTests", frontChatTests);
app.use(VueUniversalModal, {
	teleportTarget: '#my-modals',
	modalComponent: 'MyModal',
})
app.component('ToggleSwitch', ToggleSwitch)
app.mount("#app");
