/*
  Warnings:

  - You are about to drop the column `entityId` on the `Likes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_comment_entityId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_reply_entityId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_video_entityId_fkey";

-- AlterTable
ALTER TABLE "Likes" DROP COLUMN "entityId",
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "replyId" TEXT,
ADD COLUMN     "videoId" TEXT;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Replies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
