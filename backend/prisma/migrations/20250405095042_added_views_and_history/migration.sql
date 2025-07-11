-- AlterTable
ALTER TABLE "Videos" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
