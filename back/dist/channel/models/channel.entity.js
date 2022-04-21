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
exports.Channel = exports.ChannelType = void 0;
const typeorm_1 = require("typeorm");
const message_entity_1 = require("../../message/models/message.entity");
const user_entity_1 = require("../../user/models/user.entity");
var ChannelType;
(function (ChannelType) {
    ChannelType[ChannelType["private"] = 0] = "private";
    ChannelType[ChannelType["protected"] = 1] = "protected";
    ChannelType[ChannelType["public"] = 2] = "public";
})(ChannelType = exports.ChannelType || (exports.ChannelType = {}));
let Channel = class Channel {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Channel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Channel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: ChannelType.private }),
    __metadata("design:type", Number)
], Channel.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: null }),
    __metadata("design:type", String)
], Channel.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', default: () => 'now()' }),
    __metadata("design:type", Date)
], Channel.prototype, "createdTime", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, message => message.channel),
    __metadata("design:type", Array)
], Channel.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, owner => owner.id, {
        eager: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", user_entity_1.User)
], Channel.prototype, "owner", void 0);
Channel = __decorate([
    (0, typeorm_1.Entity)('channels')
], Channel);
exports.Channel = Channel;
//# sourceMappingURL=channel.entity.js.map