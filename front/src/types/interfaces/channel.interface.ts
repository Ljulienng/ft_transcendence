export enum ChannelType {
	private,
	protected,
	public,
}

export default interface ChannelI {
	name: string;
	type: ChannelType;
	password: string;
}
