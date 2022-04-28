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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const fortytwo_service_1 = require("./fortytwo.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const fortytwo_guard_1 = require("./guards/fortytwo.guard");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/service/user.service");
let AuthController = class AuthController {
    constructor(fortyTwoService, userService, jwtService) {
        this.fortyTwoService = fortyTwoService;
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async FortyTwoAuth(req) {
    }
    async FortyTwoAuthRedirect(req, res) {
        const payload = { username: req.user['username'], auth: false };
        const accessToken = await this.jwtService.signAsync(payload);
        res.cookie('jwt', accessToken, { httpOnly: true });
        res.redirect('http://localhost:3001/home');
    }
    async userinfo(req) {
        try {
            const cookie = req.cookies['jwt'];
            const data = await this.jwtService.verifyAsync(cookie);
            if (!data) {
                throw new common_1.UnauthorizedException("User not found");
            }
            const user = await this.userService.findOne(data['email']);
            return user;
        }
        catch (e) {
            throw new common_1.UnauthorizedException("wtf");
        }
    }
};
__decorate([
    (0, common_1.UseGuards)(fortytwo_guard_1.FortyTwoAuthGuard),
    (0, common_1.Get)('/auth/42'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "FortyTwoAuth", null);
__decorate([
    (0, common_1.UseGuards)(fortytwo_guard_1.FortyTwoAuthGuard),
    (0, common_1.Get)('/auth/42/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "FortyTwoAuthRedirect", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('userinfo'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "userinfo", null);
AuthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [fortytwo_service_1.FortyTwoService, user_service_1.UserService, jwt_1.JwtService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map