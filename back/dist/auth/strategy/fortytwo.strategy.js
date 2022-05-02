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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FortyTwoStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_42_1 = require("passport-42");
const fortytwo_service_1 = require("../fortytwo.service");
let FortyTwoStrategy = class FortyTwoStrategy extends (0, passport_1.PassportStrategy)(passport_42_1.Strategy, '42') {
    constructor(fortyTwoService) {
        super({
            clientID: 'f1490b0f47fb066ee9ec67fb3c14bfa541ac78a9ef44cb6558d59496e1095d08',
            clientSecret: "09974f3620e45c8fdf0dc194ba3262ba189b594ec9f0534261f02e8a0261a716",
            callbackURL: "http://localhost:3000/auth/42/callback",
            scope: ['public']
        });
        this.fortyTwoService = fortyTwoService;
    }
    async validate(accessToken, refreshToken, profile, cb) {
        const { name } = profile;
        const userIdentity = {
            username: name['userName'],
            firstname: name['givenName'],
            lastname: name['familyName'],
            email: profile['emails'][0]['value'],
        };
        return this.fortyTwoService.validateUser(userIdentity);
    }
};
FortyTwoStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fortytwo_service_1.FortyTwoService])
], FortyTwoStrategy);
exports.FortyTwoStrategy = FortyTwoStrategy;
//# sourceMappingURL=fortytwo.strategy.js.map