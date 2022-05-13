import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsOptional } from 'class-validator';
import { Channel } from "src/channel/models/channel.entity";
import { UserController } from "src/user/controller/user.controller";
import { User } from 'src/user/models/user.entity'

@Entity('messages') 
export class Message {
	
    @PrimaryGeneratedColumn()
	readonly id: number;

	@Column()
	content: string;

	@CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
	readonly createdTime: Date;

    @ManyToOne(() => Channel, channel => channel.messages, {
        onDelete: 'CASCADE',    // delete all messages if the channel is deleted
    })
    channel: Channel;

    @ManyToOne(() => User, user => user.id, {
        eager: true,
        onDelete: 'CASCADE',
    })
    user: User;
}