"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rxjs_1 = require("rxjs");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../models/user.entity");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    add(user) {
        return (0, rxjs_1.from)(this.userRepository.save(user));
    }
    addStudent(user) {
        const tmp = this.userRepository.create(user);
        console.log('Student Added');
        tmp.username = user.username;
        tmp.email = user.email;
        return (0, rxjs_1.from)(this.userRepository.save(user));
    }
    async delete(id) {
        await this.userRepository.delete(id);
    }
    async setUsername(userId, userName) {
        const currentUser = await this.userRepository.findOne({ id: userId });
        const tmp = await this.userRepository.findOne({ username: userName });
        const regex = /^[a-zA-Z0-9_]+$/;
        console.log("username: ", userName);
        console.log("tmp: ", tmp);
        console.log("currentUser: ", (await currentUser).username);
        console.log("regexp = ", regex.test(userName));
        if (tmp)
            throw new common_1.HttpException('Username already taken', common_1.HttpStatus.FORBIDDEN);
        else if ((await currentUser).username === userName)
            throw new common_1.HttpException('You already took this username', common_1.HttpStatus.FORBIDDEN);
        else if (regex.test(userName) === false)
            throw new common_1.HttpException('Wrong format for username only underscore are allowed.', common_1.HttpStatus.FORBIDDEN);
        await (0, typeorm_2.getConnection)()
            .createQueryBuilder()
            .update(user_entity_1.User)
            .set({ username: userName })
            .where("id = :id", { id: userId })
            .execute();
    }
    findAll() {
        return (0, rxjs_1.from)(this.userRepository.find());
    }
    findByUserId(userId) {
        return (0, rxjs_1.from)(this.userRepository.findOne({ id: userId })).pipe((0, rxjs_1.map)((user) => {
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            return user;
        }));
    }
    async findByUsername(name) {
        return await this.userRepository.findOne({ username: name });
    }
    async findOne(id) {
        return await this.userRepository.findOne(id);
    }
    async validateStudent(user) {
        let userTmp = undefined;
        const { username } = user;
        userTmp = await this.userRepository.findOne({ username: username });
        if (userTmp)
            return userTmp;
        const { email } = user;
        userTmp = await this.userRepository.findOne({ email: email });
        if (userTmp)
            return userTmp;
        const newUser = await this.addStudent(user);
        return newUser;
    }
    async addFriend(user, friendToAdd) {
        console.log("add friend", friendToAdd, "user = ", user);
        const friend = await this.userRepository.findOne({ username: friendToAdd.friendUsername });
        console.log("friend", friend);
        if (!friend) {
            throw new common_1.UnauthorizedException(common_1.HttpStatus.FORBIDDEN, 'This user doesn\'t exist');
        }
        const tmp = user.friends.find(el => el === String(friend.id));
        console.log("tmpy", tmp);
        if (tmp) {
            throw new common_1.UnauthorizedException(common_1.HttpStatus.FORBIDDEN, 'The user is already in your friendlist.');
        }
        else {
            console.log("friend id = ", String(friend.id));
            user.friends.push(String(friend.id));
        }
        await this.userRepository.save(user);
    }
    async retrieveFriendInfo(friendId) {
        console.log("friendID  ", friendId);
        let friendInfo = await this.userRepository.findOne(friendId);
        console.log("FriendInfo", friendInfo);
        let friend;
        if (friendInfo) {
            friend.username = friendInfo.username;
            friend.firstname = friendInfo.firstname;
            friend.lastname = friendInfo.lastname;
            return friend;
        }
        else {
            console.log("User doesn't exist");
        }
    }
    async friendList(user) {
        let friendList;
        for (const friendId of user.friends) {
            console.log("loop id = ", friendId);
            friendList.push(await this.retrieveFriendInfo(friendId));
        }
        console.log("friendlist", friendList);
        return (friendList);
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map