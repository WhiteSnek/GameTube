-- CreateTable
CREATE TABLE "WatchLater" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchLater_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WatchLater" ADD CONSTRAINT "WatchLater_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
