-- CreateTable
CREATE TABLE "invitados" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "sede" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitado_auth" (
    "id" TEXT NOT NULL,
    "invitado_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "google_id" TEXT,
    "email_verificado" BOOLEAN NOT NULL DEFAULT false,
    "ultimo_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitado_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitado_device_tokens" (
    "id" TEXT NOT NULL,
    "invitado_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "device_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitado_device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitados_email_key" ON "invitados"("email");

-- CreateIndex
CREATE INDEX "invitados_email_idx" ON "invitados"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invitado_auth_invitado_id_key" ON "invitado_auth"("invitado_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitado_auth_email_key" ON "invitado_auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invitado_auth_google_id_key" ON "invitado_auth"("google_id");

-- CreateIndex
CREATE INDEX "invitado_auth_email_idx" ON "invitado_auth"("email");

-- CreateIndex
CREATE INDEX "invitado_auth_google_id_idx" ON "invitado_auth"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitado_device_tokens_token_key" ON "invitado_device_tokens"("token");

-- CreateIndex
CREATE INDEX "invitado_device_tokens_invitado_id_idx" ON "invitado_device_tokens"("invitado_id");

-- CreateIndex
CREATE INDEX "invitado_device_tokens_token_idx" ON "invitado_device_tokens"("token");

-- AlterTable
ALTER TABLE "inscripciones" ADD COLUMN "invitado_id" TEXT;

-- CreateIndex
CREATE INDEX "inscripciones_invitado_id_idx" ON "inscripciones"("invitado_id");

-- AddForeignKey
ALTER TABLE "invitado_auth" ADD CONSTRAINT "invitado_auth_invitado_id_fkey" FOREIGN KEY ("invitado_id") REFERENCES "invitados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitado_device_tokens" ADD CONSTRAINT "invitado_device_tokens_invitado_id_fkey" FOREIGN KEY ("invitado_id") REFERENCES "invitado_auth"("invitado_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_invitado_id_fkey" FOREIGN KEY ("invitado_id") REFERENCES "invitados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

