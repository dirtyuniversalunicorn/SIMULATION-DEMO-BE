-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "callsign" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "positionLat" DOUBLE PRECISION NOT NULL,
    "positionLng" DOUBLE PRECISION NOT NULL,
    "destLat" DOUBLE PRECISION NOT NULL,
    "destLng" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "task" TEXT NOT NULL,
    "damage" DOUBLE PRECISION DEFAULT 0,
    "ammo" INTEGER DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

