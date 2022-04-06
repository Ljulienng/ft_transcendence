import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { UserI } from '../models/user.interface';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<UserEntity>);
    add(user: UserI): Observable<UserI>;
    findAll(): {
        id: number;
        name: string;
    }[];
}
