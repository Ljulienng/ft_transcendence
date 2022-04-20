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
const friend_request_entity_1 = require("../models/friend-request.entity");
let UserService = class UserService {
    constructor(userRepository, friendRequestRepository) {
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
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
        console.log(id);
        await this.userRepository.delete(id);
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
    hasRequestBeenSentOrReceived(creator, receiver) {
        return (0, rxjs_1.from)(this.friendRequestRepository.findOne({
            where: [
                { creator, receiver },
                { creator: receiver, receiver: creator },
            ]
        })).pipe((0, rxjs_1.switchMap)((friendRequest) => {
            if (!friendRequest)
                return (0, rxjs_1.of)(false);
            return (0, rxjs_1.of)(true);
        }));
    }
    sendFriendRequest(creator, receiverId) {
        if (receiverId === creator.id)
            return (0, rxjs_1.of)({ error: 'Don\'t add yourself as a friend ?!' });
        return this.findByUserId(receiverId).pipe((0, rxjs_1.switchMap)((receiver) => {
            return this.hasRequestBeenSentOrReceived(creator, receiver).pipe((0, rxjs_1.switchMap)((hasBeenReceivedOrNot) => {
                if (hasBeenReceivedOrNot)
                    return (0, rxjs_1.of)({ error: 'A friend request has already been sent of received' });
                let friendRequest = {
                    creator,
                    receiver,
                    status: 'pending',
                };
                return (0, rxjs_1.from)(this.friendRequestRepository.save(friendRequest));
            }));
        }));
    }
    getFriendRequestStatus(currentUser, receiverId) {
        return this.findByUserId(receiverId).pipe((0, rxjs_1.switchMap)((receiver) => {
            return (0, rxjs_1.from)(this.friendRequestRepository.findOne({
                where: [
                    { creator: currentUser, receiver: receiver },
                    { creator: receiver, receive: currentUser }
                ],
                relations: ['creator', 'receiver']
            }));
        }), (0, rxjs_1.switchMap)((FriendRequest) => {
            if ((FriendRequest === null || FriendRequest === void 0 ? void 0 : FriendRequest.receiver.id) === currentUser.id) {
                return (0, rxjs_1.of)({ status: 'waiting-response' });
            }
            return (0, rxjs_1.of)({ status: (FriendRequest === null || FriendRequest === void 0 ? void 0 : FriendRequest.status) || 'not-sent' });
        }));
    }
    getFriendRequestUserById(friendRequestId) {
        return (0, rxjs_1.from)(this.friendRequestRepository.findOne({
            where: [{ id: friendRequestId }],
        }));
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(friend_request_entity_1.FriendRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map