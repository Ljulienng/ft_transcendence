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
const unique_names_generator_1 = require("unique-names-generator");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    add(user) {
        user.firstname = (0, unique_names_generator_1.uniqueNamesGenerator)({ dictionaries: [unique_names_generator_1.names] });
        user.lastname = (0, unique_names_generator_1.uniqueNamesGenerator)({ dictionaries: [unique_names_generator_1.names] });
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
    updateOne(id, user) {
        delete user.email;
        delete user.username;
        delete user.firstname;
        delete user.lastname;
        return (0, rxjs_1.from)(this.userRepository.update(id, user)).pipe((0, rxjs_1.switchMap)(() => this.userRepository.findOne({ id: id })));
    }
    async setUsername(userId, userName) {
        const currentUser = await this.userRepository.findOne({ id: userId });
        const tmp = await this.userRepository.findOne({ username: userName });
        const regex = /^[a-zA-Z0-9_]+$/;
        if (tmp)
            throw new common_1.HttpException('Username already taken', common_1.HttpStatus.FORBIDDEN);
        else if ((await currentUser).username === userName)
            throw new common_1.HttpException('You already took this username', common_1.HttpStatus.FORBIDDEN);
        else if (regex.test(userName) === false)
            throw new common_1.HttpException('Wrong format for username only underscore are allowed.', common_1.HttpStatus.FORBIDDEN);
        currentUser.username = userName;
        await this.userRepository.save(currentUser);
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
        const friend = await this.userRepository.findOne({ username: friendToAdd.friendUsername });
        if (user.friends === null)
            user.friends = [];
        if (!friend) {
            throw new common_1.UnauthorizedException(common_1.HttpStatus.FORBIDDEN, 'This user doesn\'t exist');
        }
        const tmp = user.friends.find(el => el === String(friend.id));
        if (tmp) {
            throw new common_1.UnauthorizedException(common_1.HttpStatus.FORBIDDEN, 'The user is already in your friendlist.');
        }
        else {
            user.friends.push(String(friend.id));
        }
        await this.userRepository.save(user);
    }
    async deleteFriend(user, friendToDelete) {
        const friend = await this.userRepository.findOne({ username: friendToDelete.username });
        if (!friend) {
            throw new common_1.UnauthorizedException(common_1.HttpStatus.FORBIDDEN, 'This user doesn\'t exist');
        }
        const tmp = user.friends.find(el => el === String(friend.id));
        if (tmp) {
            const index = user.friends.indexOf(tmp, 0);
            user.friends.splice(index, 1);
        }
        else
            throw new common_1.UnauthorizedException(common_1.HttpStatus.FORBIDDEN, 'The user isn\'t in your friendlist.');
        await this.userRepository.save(user);
    }
    async retrieveFriendInfo(friendId) {
        let friendInfo = undefined;
        if (isNaN(+friendId))
            return friendInfo;
        friendInfo = await this.userRepository.findOne({ id: +friendId });
        console.log();
        if (friendInfo !== undefined) {
            let friend = {
                username: "",
                firstname: "",
                lastname: ""
            };
            friend.username = friendInfo.username;
            friend.firstname = friendInfo.firstname;
            friend.lastname = friendInfo.lastname;
            return friend;
        }
        else {
            console.log("User doesn't exist");
            return friendInfo;
        }
    }
    async friendList(user) {
        let friendList = [];
        let friend;
        for (let i = 0; user.friends[i]; i++) {
            if ((friend = await this.retrieveFriendInfo(user.friends[i])) !== undefined) {
                friendList.push(friend);
            }
        }
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