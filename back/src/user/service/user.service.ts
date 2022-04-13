import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { UserDto } from '../models/user.dto';
import { Student } from "src/user/dto/student.dto"
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

	addStudent(user: Student): any {
		const tmp: User = this.userRepository.create(user);

		console.log('Student Added');
		tmp.username = user.username;
		tmp.email = user.email;

		return from(this.userRepository.save(user));
	}

	async delete(id: string): Promise<any>{
		console.log(id)
		await this.userRepository.delete(id);
	}

	findAll(): any {
		return from(this.userRepository.find());
	}

	async findByUsername(name: string): Promise<User> {
		return this.userRepository.findOne({username: name});
	}

	async findOne(id: any): Promise<User> {
		return this.userRepository.findOne(id);
	}

	async validateStudent(user: Student): Promise<User> {
		let userTmp: User = undefined;
		
		const { username } = user;
		console.log('Went there');
		userTmp = await this.userRepository.findOne({username: username});
		if (userTmp)
			return userTmp;
		console.log('Went there2');
		const { email } = user;
		userTmp = await this.userRepository.findOne({email: email});
		if (userTmp)
			return userTmp;
		console.log('Went there3');
		const newUser = await this.addStudent(user);
		return newUser;

	}
}
