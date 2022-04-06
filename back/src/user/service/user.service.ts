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

	async delete(id: string): Promise<any>{
		console.log(id)
		await this.userRepository.delete(id);
	}

	findAll(): any {
		return from(this.userRepository.find());
	}

	async findOne(id: string): Promise<UserEntity> {
		return this.userRepository.findOne(id)
	}

	async validateStudent(user: Student): Promise<any> {
		let userTmp: UserEntity = undefined;
		
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
