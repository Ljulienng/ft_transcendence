import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "src/message/models/message.entity";
import { Channel } from "src/channel/models/channel.entity";

@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	// nullable/default for tests
	@Column({ nullable: true, default: null,})
	firsname: string;

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
	twoFASecret: string

	@Column({ nullable: true, default: null,})
	twoFAEnabled: boolean

	@CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
	readonly createdTime: Date

	@OneToMany(() => Message, message => message.channel)
	messages: Message[];

	@OneToMany(() => Channel, channel => channel.owner)
	channels: Channel[];
}