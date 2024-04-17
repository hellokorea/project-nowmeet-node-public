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
exports.ChatMessage = void 0;
const typeorm_1 = require("typeorm");
const chat_entity_1 = require("./chat.entity");
const users_entity_1 = require("../../../users/database/entity/users.entity");
let ChatMessage = class ChatMessage {
};
exports.ChatMessage = ChatMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChatMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_entity_1.ChatRoom, (chatRoom) => chatRoom.message),
    __metadata("design:type", chat_entity_1.ChatRoom)
], ChatMessage.prototype, "chatRoom", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User),
    __metadata("design:type", users_entity_1.User)
], ChatMessage.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ChatMessage.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", String)
], ChatMessage.prototype, "createdAt", void 0);
exports.ChatMessage = ChatMessage = __decorate([
    (0, typeorm_1.Entity)()
], ChatMessage);
//# sourceMappingURL=chat.message.entity.js.map