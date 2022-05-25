export default interface MessageI {
	userId: number;
	username: string
	content: string;
	channelId: number;
}

export default interface MessageUserI {
	senderId: number;
	receiverId: number;
	content: string;
}