<template>
	<div class="uploadAvatar">
		<img :src="this.image">
		<h2>Upload Avatar</h2>
		<p v-if="success === true">Successfully uploaded</p>
		<input type="File" id="file" ref="file" @change="onFileSelected">
		<button type="submit" @click="onUpload">Upload</button>
	</div>
</template>

<script lang="ts" >
import { defineComponent } from "@vue/runtime-core";
import http from "../http-common"

// interface formData {
// 	name: "",
// 	value: "" | Blob,
// 	fileName?: ""
// }

export default defineComponent({
	data () {
		return {
			// eslint-disable-next-line
			selectedFile: null as any,
			success: false,
			image: null as any,
		}
	},

	methods: {
		onFileSelected(): void {
			try {
				// eslint-disable-next-line
				this.selectedFile = (this.$refs.file as any).files[0];
				console.log("selectedFIle = ", this.selectedFile)
			} catch(e) {
				console.log('error: ', e)
			}
		},

		onUpload() {
			let file = new FormData();
			file.append('image', this.selectedFile, this.selectedFile.name);

			http.post('/users/uploadavatar', file)
			.then(res => {
				console.log(res),
				this.success = true;
			})
			.catch(error => {
				console.log("error on upload = ", error)
			})
			// .catch(err => {
			// 	console.log(err),
			// })
		},

		atou(b64) {
			return decodeURIComponent(escape(atob(b64)));
		},

		getAvatar() {
			try {
				http.get('users/avatar')
				.then(response => {
				btoa(unescape(encodeURIComponent(response.data)));
				console.log(this.image)
				console.log(atob(response.data))
					// this.image = window.webkitURL(response.data);
				})
				.catch(error => {
					console.log(error)
				})
			} catch(e) {
				console.log(e)
			}
		}
	},

	created () {
		this.getAvatar();
	}
})
</script>

<style lang='scss'>



</style>