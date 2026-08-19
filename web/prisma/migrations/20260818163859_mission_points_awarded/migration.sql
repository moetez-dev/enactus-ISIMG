-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "pointsAwarded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_read_idx" ON "ContactMessage"("read");

-- CreateIndex
CREATE INDEX "Event_published_date_idx" ON "Event"("published", "date");

-- CreateIndex
CREATE INDEX "Project_departmentId_idx" ON "Project"("departmentId");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");
