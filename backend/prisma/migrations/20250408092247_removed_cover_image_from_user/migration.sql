/*
  Warnings:

  - You are about to drop the column `coverImage` on the `User` table. All the data in the column will be lost.
  - Made the column `avatar` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "coverImage",
ALTER COLUMN "avatar" SET NOT NULL;
