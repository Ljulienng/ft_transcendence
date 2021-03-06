import { Column, CreateDateColumn, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable, JoinColumn } from "typeorm";
import { MessageChannel } from "src/message/models/messageChannel.entity";
import { User } from "src/user/models/user.entity";
import { ChannelMember } from "src/channelMember/models/channelMember.entity";
import { Exclude } from "class-transformer";

@Entity('channels') 
export class Channel {

	@PrimaryGeneratedColumn() 
	readonly id: number;

	@Column()
	name: string;

    @Column({ nullable: false, default: "public" })
    type: string;

	@Exclude()
    @Column({ nullable: true, default: null }) 
	password: string;

	@CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
	readonly createdTime: Date

	@OneToMany(() => MessageChannel, message => message.channel, {
		cascade: true, 
		eager: true, // Source entity object loads the target entity objects as well
		nullable: true,
	})
	messages: MessageChannel[];
	
	// a channel can have various members
	@OneToMany(() => ChannelMember, channelMember => channelMember.channel, {
		cascade: true, 
		eager: true,
		nullable: true,
	})
	channelMembers: Channel[];

	// a user can be in various channels (useful relation to get the list of channels by user)
    @ManyToOne(() => User, user => user.ownedChannels, {
    	eager: true,
        onDelete: 'CASCADE',
    })
    owner: User;

}