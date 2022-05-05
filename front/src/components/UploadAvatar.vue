<template>
	<div class="uploadAvatar">
		<div class="avatar">
			<img :src="this.image" class="Image">
		</div>
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
				window.location.reload()
			})
			.catch(error => {
				console.log("error on upload = ", error)
			})
		},

		async getAvatar() {
			http.get("/users/avatar", {responseType: "blob"})
			.then(response => {
				const blob = response.data
				console.log("res = ", response.data)
				console.log('blob - ', blob )
				this.image = URL.createObjectURL(blob);
				console.log('img = ', this.image)
			})
			.catch(error => {
				console.log(error)
			})

		},
	},

	created () {
		this.getAvatar();
	}
})
</script>

<style lang='scss'>

img.Image {
	max-width: 100%;
	max-height: 100%;

}

.avatar {
	width: 200px;
	height: 200px;
}

</style>