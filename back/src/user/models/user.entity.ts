import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {

	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	username: string;

	@Column()
	email: string;
}