import { Column, CreateDateColumn, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable, JoinColumn } from "typeorm";
import { User } from "src/user/models/user.entity";
import { Channel } from "src/channel/models/channel.entity";
import { MessageChannel } from "src/message/models/messageChannel.entity";

@Entity('channelMembers') 
export class ChannelMember {

	@PrimaryGeneratedColumn() 
	readonly id: number;

    @Column({nullable: false})
    channelId: number

    @Column({ default: false })
	owner: boolean;

    @Column({ default: false })
	admin: boolean;

    @Column({ default: false })
	muted: boolean;

    @CreateDateColumn({ nullable: true, default: null }) 
	mutedEnd: Date;

    @Column({ default: false })
	banned: boolean;

	@CreateDateColumn({ nullable: true, default: null })
	bannedEnd: Date;

    @OneToMany(() => MessageChannel, message => message.member)
	messages: MessageChannel[];

	@ManyToOne(() => User, user => user.id, {
        eager: true,
        onDelete: 'CASCADE',
    })
    user: User;

	@ManyToOne(() => Channel, channel => channel.id, {
        onDelete: 'CASCADE',
    })
    channel: Channel;
}