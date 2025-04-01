/*
  Warnings:

  - Added the required column `role` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Replies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "role" "ROLE" NOT NULL;

-- AlterTable
ALTER TABLE "Replies" ADD COLUMN     "role" "ROLE" NOT NULL;
