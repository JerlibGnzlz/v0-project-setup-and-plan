/*
  Warnings:

  - You are about to drop the column `fecha` on the `convenciones` table. All the data in the column will be lost.
  - You are about to drop the column `imagen` on the `convenciones` table. All the data in the column will be lost.
  - You are about to drop the column `iglesia` on the `inscripciones` table. All the data in the column will be lost.
  - You are about to drop the column `mensaje` on the `inscripciones` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `inscripcionId` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `metodoPago` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `moneda` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `pastorId` on the `pagos` table. All the data in the column will be lost.
  - You are about to alter the column `monto` on the `pagos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `foto` on the `pastores` table. All the data in the column will be lost.
  - You are about to drop the column `iglesia` on the `pastores` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `galeria_imagenes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fecha_fin` to the `convenciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_inicio` to the `convenciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `convencion_id` to the `inscripciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `inscripciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inscripcion_id` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metodo_pago` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "convenciones" DROP COLUMN "fecha",
DROP COLUMN "imagen",
ADD COLUMN     "costo" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "cupo_maximo" INTEGER,
ADD COLUMN     "fecha_fin" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fecha_inicio" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "imagen_url" TEXT;

-- AlterTable
ALTER TABLE "inscripciones" DROP COLUMN "iglesia",
DROP COLUMN "mensaje",
ADD COLUMN     "convencion_id" TEXT NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'pendiente',
ADD COLUMN     "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "sede" TEXT,
ADD COLUMN     "tipo_inscripcion" TEXT NOT NULL DEFAULT 'pastor',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "telefono" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pagos" DROP COLUMN "descripcion",
DROP COLUMN "inscripcionId",
DROP COLUMN "metodoPago",
DROP COLUMN "moneda",
DROP COLUMN "pastorId",
ADD COLUMN     "fecha_pago" TIMESTAMP(3),
ADD COLUMN     "inscripcion_id" TEXT NOT NULL,
ADD COLUMN     "metodo_pago" TEXT NOT NULL,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "referencia" TEXT,
ALTER COLUMN "monto" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "pastores" DROP COLUMN "foto",
DROP COLUMN "iglesia",
ADD COLUMN     "biografia" TEXT,
ADD COLUMN     "foto_url" TEXT,
ADD COLUMN     "sede" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
DROP COLUMN "role",
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "rol" "UserRole" NOT NULL DEFAULT 'ADMIN';

-- DropTable
DROP TABLE "galeria_imagenes";

-- CreateTable
CREATE TABLE "galeria" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen_url" TEXT NOT NULL,
    "categoria" TEXT,
    "convencion_id" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galeria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "galeria_categoria_idx" ON "galeria"("categoria");

-- CreateIndex
CREATE INDEX "convenciones_activa_idx" ON "convenciones"("activa");

-- CreateIndex
CREATE INDEX "convenciones_fecha_inicio_idx" ON "convenciones"("fecha_inicio");

-- CreateIndex
CREATE INDEX "inscripciones_convencion_id_idx" ON "inscripciones"("convencion_id");

-- CreateIndex
CREATE INDEX "inscripciones_estado_idx" ON "inscripciones"("estado");

-- CreateIndex
CREATE INDEX "pagos_inscripcion_id_idx" ON "pagos"("inscripcion_id");

-- CreateIndex
CREATE INDEX "pagos_estado_idx" ON "pagos"("estado");

-- CreateIndex
CREATE INDEX "pastores_activo_idx" ON "pastores"("activo");

-- CreateIndex
CREATE INDEX "pastores_sede_idx" ON "pastores"("sede");

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_convencion_id_fkey" FOREIGN KEY ("convencion_id") REFERENCES "convenciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galeria" ADD CONSTRAINT "galeria_convencion_id_fkey" FOREIGN KEY ("convencion_id") REFERENCES "convenciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
