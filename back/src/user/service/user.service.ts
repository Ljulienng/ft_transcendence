import { ConsoleLogger, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of, switchMap, map } from 'rxjs';
import { Repository } from 'typeorm';
import { UserDto } from '../models/user.dto';
import { Student } from "src/user/dto/student.dto"
import { User } from '../models/user.entity';
import { FriendRequest } from '../models/friend-request.entity';
import { FriendRequestDto, FriendRequestStatus, FriendRequest_Status } from '../models/friend-request.dto';

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(FriendRequest)
		private friendRequestRepository: Repository<FriendRequest>
	) {}

	add(user: User): any {
		return from(this.userRepository.save(user));
	}

	addStudent(user: Student): any{
		const tmp: User = this.userRepository.create(user);

		console.log('Student Added');
		tmp.username = user.username;
		tmp.email = user.email;

		return from(this.userRepository.save(user));
	}

	async delete(id: string) {
		console.log(id)
		await this.userRepository.delete(id);
	}

	findAll(): any {
		return from(this.userRepository.find());
	}

	findByUserId(userId: number): Observable<User> {
		return from(this.userRepository.findOne({id: userId})).pipe(
			map((user: User) => {
				if (!user) {
					throw new HttpException('User not found', HttpStatus.NOT_FOUND);
				}

				return user;
			})
		)
	}

	async findByUsername(name: string): Promise<User> {
		return await this.userRepository.findOne({username: name});
	}

	async findOne(id: any): Promise<User> {
		return await this.userRepository.findOne(id);
	}

	async validateStudent(user: Student): Promise<User> {
		let userTmp: User = undefined;
		
		const { username } = user;
		userTmp = await this.userRepository.findOne({username: username});
		if (userTmp)
			return userTmp;
		const { email } = user;
		userTmp = await this.userRepository.findOne({email: email});
		if (userTmp)
			return userTmp;
		const newUser = await this.addStudent(user);
		return newUser;

	}

	// Friends

	hasRequestBeenSentOrReceived( creator: User, receiver: User): Observable<boolean> {
		return from(this.friendRequestRepository.findOne({
			where: [
				{ creator, receiver },
				{ creator: receiver, receiver: creator },
			]
		})).pipe(
			switchMap((friendRequest: FriendRequest) => {
				if (!friendRequest) return of(false);
				return of(true);
			})
		)
	}

	sendFriendRequest(creator: User, receiverId: number): Observable<FriendRequest | {error: string}> {
		if (receiverId === creator.id)
			return of({error: 'Don\'t add yourself as a friend ?!'});

		return this.findByUserId(receiverId).pipe(
			switchMap((receiver: User) => {
				return this.hasRequestBeenSentOrReceived(creator, receiver).pipe(
					switchMap((hasBeenReceivedOrNot: boolean) => {
						if (hasBeenReceivedOrNot)
							return of({error: 'A friend request has already been sent of received'});
						let friendRequest: FriendRequestDto = {
							creator,
							receiver,
							status: 'pending',
						};
						return from(this.friendRequestRepository.save(friendRequest));
					})
				)
			}) // end switchMap
		)
	}

	getFriendRequestStatus(currentUser: User, receiverId: number): Observable<FriendRequestStatus> {
		return this.findByUserId(receiverId).pipe(
			switchMap((receiver: User) => {
				return from(this.friendRequestRepository.findOne({
					where: [
						{ creator: currentUser, receiver: receiver },
						{ creator: receiver, receive: currentUser }
					],
					relations: ['creator', 'receiver']
				}))
			}),
			switchMap((FriendRequest: FriendRequest) => {
				if (FriendRequest?.receiver.id === currentUser.id) {
					return of({status: 'waiting-response' as FriendRequest_Status})
				}
				return of({ status: FriendRequest?.status || 'not-sent' })
			})
		)
	}

	getFriendRequestUserById(friendRequestId: number): Observable<FriendRequest> {
		return from(this.friendRequestRepository.findOne({
			where: [{id: friendRequestId}],
		}));
	}
}
