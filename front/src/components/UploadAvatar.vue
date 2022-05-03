<template>
	<div class="uploadAvatar">
		<h1>Upload Avatar</h1>
		<p v-if="success === true">Successfully uploaded</p>
		<input type="file" id="file" ref="file" @change="onFileSelected">
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
			selectedFile: null,
			success: false
		}
	},

	methods: {
		onFileSelected(): void {
			try {
				this.selectedFile = this.$refs.file.files[0];
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
		}
	}
})
</script>
