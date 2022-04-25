import { ConsoleLogger, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of, switchMap, map } from 'rxjs';
import { getConnection, Repository } from 'typeorm';
import { UserDto } from '../models/user.dto';
import { Student } from "src/user/dto/student.dto"
import { User } from '../models/user.entity';

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
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
		await this.userRepository.delete(id);
	}

	async setUsername(userId: number, userName: string) {
		await getConnection()
		.createQueryBuilder()
		.update(User)
		.set({username: userName})
		.where("id = :id", {id: userId})
		.execute();
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

}
