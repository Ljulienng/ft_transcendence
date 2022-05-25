import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "src/channel/models/channel.entity";
import { User } from 'src/user/models/user.entity'

@Entity('messageChannel') 
export class MessageChannel {
	
    @PrimaryGeneratedColumn()
	readonly id: number;

	@Column()
	content: string;

	@CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
	readonly createdTime: Date;

    @ManyToOne(() => User, user => user.id, { 
        eager: true,
        onDelete: 'CASCADE',
    })
    user: User;

    @ManyToOne(() => Channel, channel => channel.messages, {
        onDelete: 'CASCADE',    // delete all messages if the channel is deleted
    })
    channel: Channel;
}