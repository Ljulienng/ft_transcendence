import { Column, CreateDateColumn, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";


@Entity('channelMembers') 
export class ChannelMember {

	@PrimaryGeneratedColumn() 
	readonly id: number;



}