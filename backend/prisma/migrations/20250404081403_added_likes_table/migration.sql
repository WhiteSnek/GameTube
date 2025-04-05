/*
  Warnings:

  - You are about to drop the column `likes` on the `Comments` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Replies` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ENTITY" AS ENUM ('VIDEO', 'COMMENT', 'REPLY');

-- AlterTable
ALTER TABLE "Comments" DROP COLUMN "likes";

-- AlterTable
ALTER TABLE "Replies" DROP COLUMN "likes";

-- CreateTable
CREATE TABLE "Likes" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "ENTITY" NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_video_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_comment_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_reply_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Replies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
