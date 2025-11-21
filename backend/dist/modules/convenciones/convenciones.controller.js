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
exports.ConvencionesController = void 0;
const common_1 = require("@nestjs/common");
const convenciones_service_1 = require("./convenciones.service");
const convencion_dto_1 = require("./dto/convencion.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ConvencionesController = class ConvencionesController {
    constructor(convencionesService) {
        this.convencionesService = convencionesService;
    }
    findAll() {
        return this.convencionesService.findAll();
    }
    findOne(id) {
        return this.convencionesService.findOne(id);
    }
    create(dto) {
        return this.convencionesService.create(dto);
    }
    update(id, dto) {
        return this.convencionesService.update(id, dto);
    }
    remove(id) {
        return this.convencionesService.remove(id);
    }
};
exports.ConvencionesController = ConvencionesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConvencionesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConvencionesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [convencion_dto_1.CreateConvencionDto]),
    __metadata("design:returntype", void 0)
], ConvencionesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id"),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, convencion_dto_1.UpdateConvencionDto]),
    __metadata("design:returntype", void 0)
], ConvencionesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(":id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConvencionesController.prototype, "remove", null);
exports.ConvencionesController = ConvencionesController = __decorate([
    (0, common_1.Controller)("convenciones"),
    __metadata("design:paramtypes", [convenciones_service_1.ConvencionesService])
], ConvencionesController);
//# sourceMappingURL=convenciones.controller.js.map