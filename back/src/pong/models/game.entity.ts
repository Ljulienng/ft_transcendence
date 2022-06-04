import { User } from "src/user/models/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @ManyToOne(() => User, user => user.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  playerOne: User;

  @ManyToOne(() => User, user => user.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  playerTwo: User;

  @Column({ default: 0 })
  playerOneScore: number;

  @Column({ default: 0 })
  playerTwoScore: number;

  @Column({ default: "" })
  winner: string;

  @Column({ default: "" })
  loser: string;
}
