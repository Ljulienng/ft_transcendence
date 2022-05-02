import axios, { AxiosInstance } from "axios";
const apiClient: AxiosInstance = axios.create({
	baseURL: process.env.VUE_APP_API_ENDPOINT,
	withCredentials: true
});
export default apiClient;