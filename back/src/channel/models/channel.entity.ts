import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IsOptional } from 'class-validator';
import { Message } from "src/message/models/message.entity";

@Entity('channels')
export class Channel {

	@PrimaryGeneratedColumn()
	readonly id: number;

	@Column()
	name: string;

    @Column()
    type: string;   // private, protected or public

	@IsOptional()
    @Column()
	password: string;

	@CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
	readonly createdTime: Date

	@OneToMany(() => Message, message => message.channel)
	messages: Message[];

}