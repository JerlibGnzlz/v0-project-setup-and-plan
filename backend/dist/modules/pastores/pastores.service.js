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
exports.PastoresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PastoresService = class PastoresService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.pastor.findMany({
            where: { activo: true },
            orderBy: { nombre: "asc" },
        });
    }
    async findOne(id) {
        return this.prisma.pastor.findUnique({
            where: { id },
        });
    }
    async create(dto) {
        return this.prisma.pastor.create({
            data: dto,
        });
    }
    async update(id, dto) {
        return this.prisma.pastor.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        return this.prisma.pastor.update({
            where: { id },
            data: { activo: false },
        });
    }
};
exports.PastoresService = PastoresService;
exports.PastoresService = PastoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PastoresService);
//# sourceMappingURL=pastores.service.js.map