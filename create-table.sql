-- Script SQL pour créer la table PushSubscription dans Supabase
-- À exécuter dans le SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS "PushSubscription" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "endpoint" TEXT NOT NULL UNIQUE,
  "p256dh" TEXT,
  "auth" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "PushSubscription_endpoint_idx" ON "PushSubscription"("endpoint");

-- Vérification
SELECT * FROM "PushSubscription" LIMIT 1;

