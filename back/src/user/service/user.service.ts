import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { Student } from '../dto/student.dto';
import { UserEntity } from '../models/user.entity';

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>
	) {}

	add(user: UserEntity): any {
		return from(this.userRepository.save(user));
	}

	findAll(): any {
		return from(this.userRepository.find());
	}

	async findOne(user: string): Promise<UserEntity> {
		return this.userRepository.findOne(user)
	}

	async validateStudent(user: Student): Promise<any> {
		let userTmp: UserEntity = undefined;
		
		console.log("went here");
		const { username } = user;
		userTmp = await this.userRepository.findOne({username: username});
		if (userTmp)
			return userTmp;
		
		const { email } = user;
		userTmp = await this.userRepository.findOne({email: email});
		if (userTmp)
			return userTmp;
		const newUser = await this.add(user);
		return newUser;

	}
}
