import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity';
import { FriendRequest_Status } from './friend-request.dto';


@Entity('friendRequest')
export class FriendRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.sentFriendRequests)
	creator: User;

	@ManyToOne(() => User, (user) => user.receivedFriendRequests)
	receiver: User;

	@Column()
	status: FriendRequest_Status;
}