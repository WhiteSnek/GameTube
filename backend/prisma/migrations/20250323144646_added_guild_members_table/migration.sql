-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('MEMBER', 'LEADER', 'CO_LEADER', 'ELDER');

-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "role" "ROLE" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "STATUS" NOT NULL DEFAULT 'APPROVED',

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_userId_guildId_key" ON "GuildMember"("userId", "guildId");

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
