-- AlterTable
ALTER TABLE "Lead"
ADD COLUMN     "qualificationStage" TEXT,
ADD COLUMN     "qualificationServiceNeeded" TEXT,
ADD COLUMN     "qualificationUrgency" TEXT,
ADD COLUMN     "qualificationPreferredCallbackTime" TEXT,
ADD COLUMN     "qualificationComplete" BOOLEAN NOT NULL DEFAULT false;
