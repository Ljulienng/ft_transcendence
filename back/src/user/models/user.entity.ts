import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;
}