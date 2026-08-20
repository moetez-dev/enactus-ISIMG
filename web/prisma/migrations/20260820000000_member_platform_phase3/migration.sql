-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "hours" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "fieldOfStudy" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "memberId" TEXT,
ADD COLUMN     "memberSince" TIMESTAMP(3),
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "publicProfile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "studyLevel" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");