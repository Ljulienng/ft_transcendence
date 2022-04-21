import { Column, CreateDateColumn, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsOptional } from 'class-validator';
import { Message } from "src/message/models/message.entity";
import { User } from "src/user/models/user.entity";

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

    @ManyToOne(() => User, owner => owner.id, {
        eager: true,
        onDelete: 'CASCADE',
    })
    owner: User;

}