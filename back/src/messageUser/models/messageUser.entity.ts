import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsOptional } from 'class-validator';
import { UserController } from "src/user/controller/user.controller";
import { User } from 'src/user/models/user.entity'

@Entity('messageUser') 
export class MessageUser {
	
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
    sender: User;

    @ManyToOne(() => User, user => user.id, {
        eager: true,
        onDelete: 'CASCADE',    // delete all messages if the channel is deleted
    })
    receiver: User;
}