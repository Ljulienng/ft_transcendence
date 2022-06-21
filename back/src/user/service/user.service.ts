import { ConsoleLogger, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of, switchMap, map, tap} from 'rxjs';
import { getConnection, Repository } from 'typeorm';
import { UserDto } from '../models/user.dto';
import { Student } from "src/user/dto/student.dto"
import { User, Friend } from '../models/user.entity';
import { isNumber } from 'class-validator';
import { names, uniqueNamesGenerator } from 'unique-names-generator';
import { JwtService } from '@nestjs/jwt';
import { Channel } from 'src/channel/models/channel.entity';
import { ChannelService } from 'src/channel/service/channel.service';
import { MessageUser } from 'src/messageUser/models/messageUser.entity';
import { MessageUserService } from 'src/messageUser/service/messageUser.service';
import { CreateMessageUserDto } from 'src/messageUser/models/messageUser.dto';
import { ChannelMemberService } from 'src/channelMember/service/channelMember.service';
import { PongService } from 'src/pong/pong.service';
import { Match } from 'src/pong/models/match.entity';

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(User)
		protected userRepository: Repository<User>,
		private jwtService: JwtService,
		@Inject(ChannelService)
		private channelService: ChannelService,
		@Inject(MessageUserService)
		private messageUserService: MessageUserService,
		@Inject(ChannelMemberService)
		private channelMemberService: ChannelMemberService,
		@Inject(PongService)
		private pongService: PongService,
		@InjectRepository(Match)
		protected matchRepository: Repository<Match>,
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

	async addStudent(user: Student): Promise<User> {
		const tmp: User = this.userRepository.create(user);

		console.log('Student Added');
		tmp.username = user.username;
		tmp.email = user.email;
		tmp.status = 'Offline';

		return this.userRepository.save(user);
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

	async setUsername(currentUser: User, newUsername: string) {
		// const currentUser = await this.userRepository.findOne({id: userId});
		const tmp = await this.userRepository.findOne({username: newUsername})
		const regex = /^[a-zA-Z0-9_]+$/
		
		// console.log("currentUser.username = ",currentUser.username , 'newUsername', newUsername )
		if (currentUser.username === newUsername)
			throw new HttpException('You already took this username', HttpStatus.FORBIDDEN);
		else if (tmp)
			throw new HttpException('Username already taken', HttpStatus.FORBIDDEN);
		else if (regex.test(newUsername) === false)
			throw new HttpException('Wrong format for username only underscore are allowed.', HttpStatus.FORBIDDEN);
		currentUser.username = newUsername;
		await this.userRepository.save(currentUser);
	}

	async findAll() {
		return await this.userRepository.find();
	}

	async findByCookie(cookie: any): Promise<User> {
		// Decode cookie to a payload then search within rep using username from payload
		const user = await this.userRepository.findOne({username: this.jwtService.decode(cookie)["username"]});
		return user;
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

	async findOne(object: any): Promise<User> {
		return await this.userRepository.findOne(object);
	}

	async validateStudent(user: Student): Promise<User> {
		let userTmp: User = undefined;
		
		const { username } = user;

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

	async firstUpdate(currentUser: User, infoToUpdate: any) {
		currentUser.firstTime = false;
		if (infoToUpdate.username !== "")
			currentUser.username = infoToUpdate.username;
		if (infoToUpdate.firstName !== "")
			currentUser.firstname = infoToUpdate.firstName;
		if (infoToUpdate.lastName !== "")
			currentUser.lastname = infoToUpdate.lastName;
		if (infoToUpdate.email !== "")
			currentUser.email = infoToUpdate.email;
		await this.userRepository.save(currentUser);
	
	}

	// ================ FRIENDS ===================

	async addFriend(user: User, friendToAdd: any) {
		const friend = await this.userRepository.findOne({username: friendToAdd.friendUsername});

		if (user.friends === null)
			user.friends = []
		if (!friend) {
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'This user doesn\'t exist');
		}

		const tmp = user.friends.find(el => el === String(friend.id))

		if (await this.checkIfBlocked(user, friend.id))
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'The user you are trying to add is blocked.')
		if (tmp)
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'The user is already in your friendlist.')
		else if (friend.id === user.id)
		throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'You are trying to add yourself, make some friends.')
		else { 
			user.friends.push(String(friend.id))
		}
		await this.userRepository.save(user);
	}

	async checkIfFriend(userId: number, otherUserId: number) {
		const user = await this.userRepository.findOne({id: userId});
		if (user.friends === null)
			user.friends = []
		const tmp = user.friends.find((friend) => {
			if (friend === String(otherUserId))
				return friend
		})

		if (tmp)
			return true;
		else
			return false
	}

	async deleteFriend(user: User, friendToDelete: string) {
		const friend = await this.userRepository.findOne({username: friendToDelete});


		if (!friend) {
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'This user doesn\'t exist');
		}
		const tmp = user.friends?.find(el => el === String(friend.id))
		if (tmp) {
			const index = user.friends.indexOf(tmp, 0);
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
		
		if (friendInfo !== undefined) {

			let friend: Friend = {
				id: 0,
				username: "",
				firstname: "",
				lastname: "",
				status: "Offline"
			};

			friend.id = friendInfo.id;
			friend.username = friendInfo.username;
			friend.firstname = friendInfo.firstname;
			friend.lastname = friendInfo.lastname;
			friend.status = friendInfo.status

			return friend;
		}
		else {
			return friendInfo
		}
	}


	async friendList(user: User): Promise<Friend[]> {
		let friendList = [];
		let friend;

		for (let i = 0; user.friends[i]; i++) {
			if ((friend = await this.retrieveFriendInfo(user.friends[i])) !== undefined){
				friendList.push(friend);
			}
		}
		return (friendList);
	}

	// ================ CHANNEL ===================


	async ownedChannel(user: User): Promise<Channel[]> {
		return await this.channelService.findChannelsWhereUserIsOwner(user);
	}

	async joinedChannel(user: User): Promise<Channel[]> {
		const channelMembers = await this.channelMemberService.findChannelsByUser(user);
		const channelsId: number[] = [];
		const channels: Channel[] = [];
		
		channelMembers.forEach(cm => {
			channelsId.push(cm.channelId);
		});
		for (const id in channelsId)  {
			channels.push(await this.channelService.findChannelById(channelsId[id]));
		}
		return channels;
	}

	// ================ DOUBLE FA AUTHENTICATION ===================


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

	// ================ MESSAGES ===================


	async saveMessage(userId: number, createMessageUserDto: CreateMessageUserDto) {
        const sender = await this.userRepository.findOne({id: userId});
        const receiver = await this.userRepository.findOne({id: createMessageUserDto.receiverId});

        if (!receiver)
            throw new HttpException('this user doesn\'t exist', HttpStatus.FORBIDDEN);
        return await this.messageUserService.saveMessage(sender, receiver, createMessageUserDto);
	}

	async getMessage(senderId: number, receiverId: number) {
		const sender = await this.userRepository.findOne({id: senderId});
		const receiver = await this.userRepository.findOne({id: receiverId});
		const messages =  await this.messageUserService.getMessages(sender, receiver);

		return messages;
	}

	// ================ BLOCKED USER ===================

	async getBlockedUser(user: User) {
		if (user.blocked === null)
			user.blocked = [];
		let blockedList = [];
		let blockedUser;

		for (let i = 0; user.blocked[i]; i++) {
			if ((blockedUser = await this.retrieveFriendInfo(user.blocked[i])) !== undefined){
				blockedList.push(blockedUser);
			}
		}
		return (blockedList)
	}

	async blockUser(user: User, userId: number) {
		if (user.blocked === null)
			user.blocked = [];

		if (await this.checkIfFriend(user.id, userId)) {
			await this.deleteFriend(user, (await this.userRepository.findOne({id: userId})).username)
		}

		if (await this.checkIfBlocked(user, userId))
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'The user is already blocked.');
		else
			user.blocked.push(String(userId));
		await this.userRepository.save(user);
	}

	async unblockUser(user: User, userId: number) {
		const tmp = await user.blocked.find(el => el === String(userId));

		if (!tmp)
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'The user isn\'t blocked.');
		else {
			const index = user.blocked.indexOf(tmp, 0);

			user.blocked.splice(index, 1);
		}
		await this.userRepository.save(user);
	}

	// async checkIfBlocked(user: User, userId: number) {

	// 	const tmp =  user.blocked.find(el => el === String(userId));
	// 	if (tmp)
	// 		return true;
	// 	else
	// 		return false
	// }

	async checkIfBlocked(user: User, otherUserId: number) {
		console.log(user);
		if (user.blocked === null)
			user.blocked = [];

		const otherUser = await this.userRepository.findOne({id: otherUserId});
		const ifOtherIsBlocked = user.blocked.find(el => el === String(otherUserId));
		let ifUserHasBeenBlocked: string;
		if (otherUser.blocked !== null)
			ifUserHasBeenBlocked = otherUser.blocked.find(el => el === String(user.id));

		if (!otherUser)
			throw new UnauthorizedException(HttpStatus.FORBIDDEN, 'Other user doesn\'t exist.');
		if (ifOtherIsBlocked || ifUserHasBeenBlocked)
			return true;
		else
			return false
	}

	// ================ GAME ===================

	async getMatchHistory(user: User) {
		const matchList =  await this.pongService.getMatchHistory(user);
		return await this.pongService.getMatchHistory(user)
	}
}
