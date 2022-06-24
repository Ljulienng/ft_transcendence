import { createApp } from "vue";
import App from "./App.vue";
import Sidebar from "./components/Sidebar.vue";
import UploadAvatar from "./components/user/UploadAvatar.vue"
import ChatIndex from "./components/chat/ChatIndex.vue"
import ChannelBox from "./components/chat/ChannelBox.vue";
import router from "./router";
import store from "./store";
import 'vue-universal-modal/dist/index.css'
import VueUniversalModal from 'vue-universal-modal'
import Notifications from '@kyvg/vue3-notification'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

const app = createApp(App);
app.use(router);
app.config.globalProperties.$store = store;
app.use(store);
app.component("Sidebar", Sidebar);
app.component("UploadAvatar", UploadAvatar);
app.use(Notifications);
app.component("ChatIndex", ChatIndex);
app.component("ChannelBox", ChannelBox);
app.use(VueUniversalModal, {
	teleportTarget: '#my-modals',
	modalComponent: 'MyModal',
})
app.mount("#app");
