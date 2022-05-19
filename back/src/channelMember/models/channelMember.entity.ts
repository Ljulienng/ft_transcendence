import { Column, CreateDateColumn, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { User } from "src/user/models/user.entity";
import { Channel } from "src/channel/models/channel.entity";

@Entity('channelMembers') 
export class ChannelMember {

	@PrimaryGeneratedColumn() 
	readonly id: number;

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

	@ManyToOne(() => User, member => member.id, {
        eager: true,
        onDelete: 'CASCADE',
    })
    user: User;

	@ManyToOne(() => Channel, channel => channel.id, {
        onDelete: 'CASCADE',
    })
    channel: Channel;
}