import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { MessageChannel } from "src/message/models/messageChannel.entity";
import { Channel } from "src/channel/models/channel.entity";
import { colors } from "unique-names-generator";
import { ChannelMember } from "src/channelMember/models/channelMember.entity";

export type Friend = {
	username: string;
	firstname: string;
	lastname: string;
	status: string;
}

@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	// nullable/default for tests
	@Column({ nullable: true, default: null,})
	firstname: string;

	@Column({ nullable: true, default: null,})
	lastname: string;

	@Column({ nullable: true, default: null,})
	username: string;

	@Column({ nullable: true, default: null,})
	email: string;

	@Column({ default: false,})
	admin: boolean;

	@Column({ default: false,})
	banned: boolean;

	@Column({ nullable: true, default: null,})
	twoFASecret?: string;

	@Column({ nullable: true, default: false,})
	twoFAEnabled: boolean;

	@CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
	readonly createdTime: Date;

	@OneToMany(() => MessageChannel, message => message.channel)
	messages: MessageChannel[]; 

	// only where user is owner
	@OneToMany(() => Channel, channel => channel.owner)
	ownedChannels: Channel[];

	@OneToMany(() => ChannelMember, channelMember => channelMember.user, {
		cascade: true,
	})
	channelMembers: ChannelMember[];

	@Column("simple-array", {nullable: true})
	friends: string[];

	@Column({default: 'Offline'})
	status: string;

	@Column({nullable: true})
	profileImage: string;
}