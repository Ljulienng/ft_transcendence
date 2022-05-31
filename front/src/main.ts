import { createApp } from "vue";
import App from "./App.vue";
import HelloWorld from "./components/HelloWorld.vue";
import Sidebar from "./components/Sidebar.vue";
import UploadAvatar from "./components/user/UploadAvatar.vue"
import ChatTests from "./components/chat/ChatTests.vue"
import frontChatTests from "./components/frontChatTests.vue"
import router from "./router";
import store from "./store";
import 'vue-universal-modal/dist/index.css'
import VueUniversalModal from 'vue-universal-modal'
import Notifications from '@kyvg/vue3-notification'
// import ToggleSwitch from 'vuejs-toggle-switch'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

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
// app.use(ToggleSwitch)
// app.component('ToggleSwitch', ToggleSwitch)
app.mount("#app");
