<template>
  <div class='app'>
      <h1>Chat</h1>
    <div class='messages'>
      <Message
          v-for='message in messages'
          :key='message.id'
          :class='["message", { right: message.isMine }]'
          :dark='message.isMine'
          :text='message.text'
          :author='message.author'
      />
    </div>

    <ChatBox
        class='chat-box'
        @submit='onSubmit'
    />

    <RegisterDialog
        v-if='!user'
        @submit='onRegister'
    />
  </div>
</template>

<script>
import Message from '@/components/Message.vue'
import ChatBox from '@/components/ChatBox.vue'
import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";

export default defineComponent({
  name: 'Chat',
  computed: {
    ...mapGetters("auth", {
      getUserProfile: "getUserProfile",
    }),
  },
  // Here we register the components which
  // we are going to use in the template
  components: {
    ChatBox,
    Message
  },
  // This is going to be called 
  //  when the component gets rendered
  created() {
    this.getChat();
  },
//   methods: {
//     this.user = getUserProfile();
//     },
//     getChat() {
//       listenChat((chat) => {
//         this.messages = chat.reverse().map(m => ({
//           ...m,
//           isMine: m.uid && m.uid === this.user?.id
//         }));
//       });
//     },
//     // This method will be called when a new message is sent
//     onSubmit(event, text) {
//       event.preventDefault();

//       sendMessage({
//         text,
//         uid: this.user?.id,
//         author: this.user?.name
//       });
//     }
//   },
//   data: () => ({
//     user: undefined,
//     messages: []
//   })
});
</script>

<style>
/* @font-face {
  font-family: 'Georama';
  src: url('./assets/Georama.ttf');
}

@font-face {
  font-family: 'Georama';
  src: url('./assets/Georama.ttf');
  font-weight: bold;
} */

* {
  box-sizing: border-box;
}

html {
  font-family: 'Georama', sans-serif;
}

body {
  margin: 0;
}

chatbutton {
  border: 0;
  background: #fff82a;
  color: white;
  cursor: pointer;
  padding: 1rem;
}

input {
  border: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
}
</style>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.messages {
  flex-grow: 1;
  overflow: auto;
  padding: 1rem;
}

.message + .message {
  margin-top: 1rem;
}

.message.right {
  margin-left: auto;
}
</style>
