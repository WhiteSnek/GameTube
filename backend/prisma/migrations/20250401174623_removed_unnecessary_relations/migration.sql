-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Replies" DROP CONSTRAINT "Replies_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Replies" DROP CONSTRAINT "Replies_videoId_fkey";
