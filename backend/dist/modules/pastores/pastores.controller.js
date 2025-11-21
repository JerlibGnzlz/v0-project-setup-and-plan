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
exports.PastoresController = void 0;
const common_1 = require("@nestjs/common");
const pastores_service_1 = require("./pastores.service");
const pastor_dto_1 = require("./dto/pastor.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PastoresController = class PastoresController {
    constructor(pastoresService) {
        this.pastoresService = pastoresService;
    }
    findAll() {
        return this.pastoresService.findAll();
    }
    findOne(id) {
        return this.pastoresService.findOne(id);
    }
    create(dto) {
        return this.pastoresService.create(dto);
    }
    update(id, dto) {
        return this.pastoresService.update(id, dto);
    }
    remove(id) {
        return this.pastoresService.remove(id);
    }
};
exports.PastoresController = PastoresController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PastoresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PastoresController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pastor_dto_1.CreatePastorDto]),
    __metadata("design:returntype", void 0)
], PastoresController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pastor_dto_1.UpdatePastorDto]),
    __metadata("design:returntype", void 0)
], PastoresController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PastoresController.prototype, "remove", null);
exports.PastoresController = PastoresController = __decorate([
    (0, common_1.Controller)("pastores"),
    __metadata("design:paramtypes", [pastores_service_1.PastoresService])
], PastoresController);
//# sourceMappingURL=pastores.controller.js.map