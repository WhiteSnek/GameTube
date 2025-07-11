/*
  Warnings:

  - Added the required column `videoId` to the `Replies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Replies" ADD COLUMN     "videoId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Replies" ADD CONSTRAINT "Replies_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
