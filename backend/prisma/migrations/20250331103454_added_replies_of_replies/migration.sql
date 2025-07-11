-- AlterTable
ALTER TABLE "Replies" ADD COLUMN     "replyId" TEXT;

-- AddForeignKey
ALTER TABLE "Replies" ADD CONSTRAINT "Replies_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
