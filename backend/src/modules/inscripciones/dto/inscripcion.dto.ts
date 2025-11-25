import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';

export enum EstadoPago {
    PENDIENTE = 'PENDIENTE',
    COMPLETADO = 'COMPLETADO',
    CANCELADO = 'CANCELADO',
    REEMBOLSADO = 'REEMBOLSADO',
}

export class CreateInscripcionDto {
    @IsString()
    convencionId: string;

    @IsString()
    nombre: string;

    @IsString()
    apellido: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsString()
    sede?: string;

    @IsOptional()
    @IsString()
    tipoInscripcion?: string;

    @IsOptional()
    @IsString()
    notas?: string;
}

export class UpdateInscripcionDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    apellido?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsString()
    sede?: string;

    @IsOptional()
    @IsString()
    tipoInscripcion?: string;

    @IsOptional()
    @IsString()
    estado?: string;

    @IsOptional()
    @IsString()
    notas?: string;
}

export class CreatePagoDto {
    @IsString()
    inscripcionId: string;

    @IsString()
    monto: string; // Decimal as string

    @IsString()
    metodoPago: string;

    @IsOptional()
    @IsEnum(EstadoPago)
    estado?: EstadoPago;

    @IsOptional()
    @IsString()
    referencia?: string;

    @IsOptional()
    @IsString()
    notas?: string;
}

export class UpdatePagoDto {
    @IsOptional()
    @IsString()
    monto?: string;

    @IsOptional()
    @IsString()
    metodoPago?: string;

    @IsOptional()
    @IsEnum(EstadoPago)
    estado?: EstadoPago;

    @IsOptional()
    @IsString()
    referencia?: string;

    @IsOptional()
    @IsString()
    notas?: string;
}

