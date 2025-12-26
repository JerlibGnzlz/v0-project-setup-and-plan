-- AlterTable
ALTER TABLE "credenciales_capellania" ADD COLUMN IF NOT EXISTS "invitado_id" TEXT;
ALTER TABLE "credenciales_capellania" ADD COLUMN IF NOT EXISTS "solicitud_credencial_id" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "credenciales_capellania_invitado_id_idx" ON "credenciales_capellania"("invitado_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "credenciales_capellania_solicitud_credencial_id_key" ON "credenciales_capellania"("solicitud_credencial_id") WHERE "solicitud_credencial_id" IS NOT NULL;

-- AddForeignKey (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'credenciales_capellania_invitado_id_fkey'
    ) THEN
        ALTER TABLE "credenciales_capellania" 
        ADD CONSTRAINT "credenciales_capellania_invitado_id_fkey" 
        FOREIGN KEY ("invitado_id") 
        REFERENCES "invitados"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'credenciales_capellania_solicitud_credencial_id_fkey'
    ) THEN
        ALTER TABLE "credenciales_capellania" 
        ADD CONSTRAINT "credenciales_capellania_solicitud_credencial_id_fkey" 
        FOREIGN KEY ("solicitud_credencial_id") 
        REFERENCES "solicitudes_credenciales"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
