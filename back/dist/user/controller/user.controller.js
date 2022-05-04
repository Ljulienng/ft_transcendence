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
exports.UserController = exports.storage = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const user_entity_1 = require("../models/user.entity");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../service/user.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const multer_1 = require("multer");
const platform_express_1 = require("@nestjs/platform-express");
const path = require("path");
const rxjs_2 = require("rxjs");
const path_1 = require("path");
exports.storage = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads/profileimages',
        filename: (req, file, cb) => {
            const filename = req.user.username;
            const extension = path.parse(file.originalname).ext;
            cb(null, filename + extension);
        }
    })
};
let UserController = class UserController {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    add(user) {
        return this.userService.add(user);
    }
    delete(idToDelete) {
        return this.userService.delete(idToDelete);
    }
    findAll() {
        return this.userService.findAll();
    }
    findUserById(userId) {
        console.log("went in userId");
        return this.userService.findByUserId(userId);
    }
    async getFriendList(req) {
        try {
            const user = req.user;
            return await this.userService.friendList(user);
        }
        catch (e) {
            throw new common_1.UnauthorizedException("Error: getFriendList");
        }
    }
    async addFriend(req, friendToAdd) {
        let user;
        try {
            user = req.user;
            await this.userService.addFriend(user, friendToAdd);
        }
        catch (e) {
            throw e;
        }
    }
    async deleteFriend(req, friendToDelete) {
        try {
            const user = req.user;
            await this.userService.deleteFriend(user, friendToDelete);
        }
        catch (e) {
            throw e;
        }
    }
    async userInfo(req, userName) {
        try {
            const user = req.user;
            this.userService.setUsername(user.id, userName.username);
        }
        catch (e) {
            throw e;
        }
    }
    uploadFile(file, req) {
        console.log("filename = ", file.filename);
        const user = req.user;
        return this.userService.updateOne(user.id, { profileImage: file.filename }).pipe((0, rxjs_1.tap)((user) => console.log(user)), (0, rxjs_2.map)((user) => ({ profileImage: user.profileImage })));
    }
    findProfileImage(req, res) {
        return (res.sendFile((0, path_1.join)(process.cwd(), '/uploads/profileimages/' + req.user.profileImage)));
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Object)
], UserController.prototype, "add", null);
__decorate([
    (0, common_1.Delete)('/delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], UserController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('/info/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", rxjs_1.Observable)
], UserController.prototype, "findUserById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/friendlist'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getFriendList", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/addfriend'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addFriend", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('/deletefriend'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteFriend", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/setusername'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "userInfo", null);
__decorate([
    (0, common_1.Post)('/uploadavatar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', exports.storage)),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], UserController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/avatar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findProfileImage", null);
UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService, jwt_1.JwtService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map