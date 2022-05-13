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

	@OneToMany(() => Message, message => message.channel, {
		cascade: true, 
		eager: true, // Source entity object loads the target entity objects as well
		nullable: true,
	})
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

}