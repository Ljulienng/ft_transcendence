import { User } from "src/user/models/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm";

@Entity()
export class Match {
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

  @ManyToOne(() => User, user => user.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  winner: User;

  @ManyToOne(() => User, user => user.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  loser: User;

  @Column({ default: true })
  inProgress: boolean;
}
