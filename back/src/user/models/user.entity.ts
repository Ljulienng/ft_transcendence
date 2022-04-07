import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	username: string;

	@Column()
	email: string;
}