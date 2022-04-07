import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { UserDto } from '../models/user.dto';
import { User } from '../models/user.entity';

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {}

	add(user: User): any {
		return from(this.userRepository.save(user));
	}

	async delete(id: string): Promise<any>{
		console.log(id)
		await this.userRepository.delete(id);
	}

	findAll(): any {
		return from(this.userRepository.find());
	}

	async findOne(id: string): Promise<User> {
		return this.userRepository.findOne(id)
	}

	async validateStudent(user: UserDto): Promise<any> {
		let userTmp: User = undefined;
		
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
