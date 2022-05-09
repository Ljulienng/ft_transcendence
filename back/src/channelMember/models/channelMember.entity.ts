import { Column, CreateDateColumn, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";


@Entity('channelMembers') 
export class ChannelMember {

	@PrimaryGeneratedColumn() 
	readonly id: number;

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

}