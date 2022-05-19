import { ConsoleLogger, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of, switchMap, map, tap} from 'rxjs';
import { getConnection, Repository } from 'typeorm';
import { UserDto } from '../models/user.dto';
import { Student } from "src/user/dto/student.dto"
import { User, Friend } from '../models/user.entity';
import { isNumber } from 'class-validator';
import { names, uniqueNamesGenerator } from 'unique-names-generator';
import { Channel } from 'src/channel/models/channel.entity';


@Injectable()
export class UserService {

	constructor(
		@InjectRepository(User)
		protected userRepository: Repository<User>,
	) {}

	async onModuleInit(): Promise<void> {
		let user: Student = {
			username: 'norminet',
			email: "norminet@cat.42.fr",
		}

		const userTmp = await this.userRepository.findOne({email: user.email});
		if (userTmp)
			return ;
		const tmp: User = this.userRepository.create(user);

		console.log('Norminet Added');
		tmp.username = user.username;
		tmp.email = user.email;

		this.userRepository.save(user);

	}

	add(user: User): any {
		user.firstname = uniqueNamesGenerator({dictionaries: [names]})
		user.lastname = uniqueNamesGenerator({dictionaries: [names]})
		user.status = "Offline"

		return from(this.userRepository.save(user));
	}

	addStudent(user: Student): any {
		const tmp: User = this.userRepository.create(user);

		console.log('Student Added');
		tmp.username = user.username;
		tmp.email = user.email;
		tmp.status = 'Offline';

		return from(this.userRepository.save(user));
	}

	async delete(id: string) {
		await this.userRepository.delete(id);
	}

	updateOne(id: number, user: Partial<User>): Observable<any> {
		delete user.email;
		delete user.username;
		delete user.firstname;
		delete user.lastname;
		delete user.status;

		return from(this.userRepository.update(id, user)).pipe(
			switchMap(() => this.userRepository.findOne({id: id}))
		)
	}

	async setUsername(userId: number, userName: string) {
		const currentUser = await this.userRepository.findOne({id: userId});
		const tmp = await this.userRepository.findOne({username: userName})
		const regex = /^[a-zA-Z0-9_]+$/

		// console.log("username: ", userName);
		// console.log("tmp: ", tmp);
		// console.log("currentUser: ", (await currentUser).username);
		// console.log("regexp = ", regex.test(userName));
		if (tmp)
			throw new HttpException('Username already taken', HttpStatus.FORBIDDEN);
		else if ((await currentUser).username === userName)
			throw new HttpException('You already took this username', HttpStatus.FORBIDDEN);
		else if (regex.test(userName) === false)
			throw new HttpException('Wrong format for username only underscore are allowed.', HttpStatus.FORBIDDEN);
		currentUser.username = userName;
		await this.userRepository.save(currentUser);
		// await this.userRepository.save({})
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
		// if (user.email === "norminet") { // create second user for testing purposes

		// }
		userTmp = await this.userRepository.findOne({username: username});
		if (userTmp) {
			if (userTmp.status === 'Offline')
				userTmp.status = 'Online';
			return userTmp;
		}
		const { email } = user;
		userTmp = await this.userRepository.findOne({email: email});
		if (userTmp) {
			if (userTmp.status === 'Offline')
				userTmp.status = 'Online';
			return userTmp;
		}
		const newUser = await this.addStudent(user);
		return newUser;

	}

	async addFriend(user: User, friendToAdd: any) {
		const friend = await this.userRepository.findOne({username: friendToAdd.friendUsername});
		if (user.friends === null)
			user.friends = []
		if (!friend) {
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'This user doesn\'t exist');
		}

		const tmp = user.friends.find(el => el === String(friend.id))

		if (tmp) {
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'The user is already in your friendlist.')
		}
		else { 
			user.friends.push(String(friend.id))
		}
		await this.userRepository.save(user);
	}

	async deleteFriend(user: User, friendToDelete: any) {
		const friend = await this.userRepository.findOne({username: friendToDelete.username});

		if (!friend) {
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'This user doesn\'t exist');
		}
		const tmp = user.friends.find(el => el === String(friend.id))
		if (tmp) {
			// console.log("friend id deleted= ", String(friend.id))
			const index = user.friends.indexOf(tmp, 0);
			// console.log("friend index = ", index)
			user.friends.splice(index, 1); 
		}
		else
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'The user isn\'t in your friendlist.')
		await this.userRepository.save(user);
	}

	async retrieveFriendInfo(friendId: string): Promise<Friend> {
		let friendInfo: User = undefined;
		if (isNaN(+friendId))
			return friendInfo;
		friendInfo = await this.userRepository.findOne({id: +friendId});
		console.log()
		
		if (friendInfo !== undefined) {

			let friend: Friend = {
				username: "",
				firstname: "",
				lastname: "",
				status: "Offline"
			};

			friend.username = friendInfo.username;
			friend.firstname = friendInfo.firstname;
			friend.lastname = friendInfo.lastname;
			friend.status = friendInfo.status

			return friend;
		}
		else {
			console.log("User doesn't exist")
			return friendInfo
		}
	}


	async friendList(user: User): Promise<Friend[]> {
		let friendList = [];
		let friend;

		// console.log("user.friends = ", user.friends)
		for (let i = 0; user.friends[i]; i++) {
			if ((friend = await this.retrieveFriendInfo(user.friends[i])) !== undefined){
				friendList.push(friend);
			}
		}
		// console.log("Friendlist = ", friendList)
		return (friendList);
	}

	async setStatus(user: User, newStatus: string) {
		// if (newStatus !== 'Online'  'Offline'  'In game'  'Away'  'Occupied')
		// 	throw new HttpException("Incorrect user status", HttpStatus.FORBIDDEN)
		if (newStatus === 'Online' || 'Offline')
			console.log("user", user.username , "is", newStatus)
		user.status = newStatus;
		this.userRepository.save(user)
	}

	async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
		return this.userRepository.update(userId, {
			twoFASecret: secret
		});
	}

	async turnOnTwoFactorAuthentication(userId: number) {
		return this.userRepository.update(userId, {
			twoFAEnabled: true
		});
	}
	async turnOffTwoFactorAuthentication(userId: number) {
		return this.userRepository.update(userId, {
			twoFAEnabled: false
		});
	}
	

	// async removeJoinedChannel(userId: number, channelToLeave: Channel) {
	// 	const user = await this.userRepository.findOne({id: userId});
	// 	const tmp = user.joinedChannels.find(channel => channel.id === channelToLeave.id);
    //     const index = user.joinedChannels.indexOf(tmp, 0);
    //     user.joinedChannels.splice(index, 1);
	// }

	// addJoinedChannel(user: User, welcomingChannel: Channel) {
	// 	user.joinedChannels.push(welcomingChannel);
	// }
}
