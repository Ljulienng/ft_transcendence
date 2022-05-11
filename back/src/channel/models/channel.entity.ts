import { Column, CreateDateColumn, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { IsOptional } from 'class-validator';
import { Message } from "src/message/models/message.entity";
import { User } from "src/user/models/user.entity";
import { ChannelMember } from "src/channelMember/models/channelMember.entity";

export enum ChannelType {
	private,
	protected,
	public,
}

@Entity('channels') 
export class Channel {

	@PrimaryGeneratedColumn() 
	readonly id: number;

	@Column()
	name: string;

    @Column({ nullable: false, default: ChannelType.private })
    type: ChannelType;

    @Column({ nullable: true, default: null })
	password: string;

	@CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
	readonly createdTime: Date

	@OneToMany(() => Message, message => message.channel)
	messages: Message[];
	
	@OneToMany(() => ChannelMember, channelMember => channelMember.channel, {
		cascade: true,
		eager: true,
		nullable: true,
	})
	channelMembers: ChannelMember[];

    @ManyToOne(() => User, owner => owner.id, {
        eager: true,
        onDelete: 'CASCADE',
    })
    owner: User;

	@Column("simple-array", {nullable: true})
	membersId: number[];	// just store the userId of the members of the channel

	// @ManyToMany(() => User, { onDelete: 'CASCADE'})
	// // @JoinTable()
	// users: User[];	// a supprimer si participants ok pour remplacer
}