-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "username" TEXT,
    "twitterHandle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreateTopic" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "investment" DECIMAL(80,18) NOT NULL DEFAULT 0,
    "promoterId" INTEGER,
    "position" INTEGER NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,

    CONSTRAINT "CreateTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metadata" (
    "topicId" TEXT NOT NULL,
    "topicTitle" TEXT NOT NULL,
    "topicContent" TEXT NOT NULL,
    "imageUrl" TEXT,
    "topicHash" TEXT NOT NULL,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("topicId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER,
    "topicId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSync" (
    "eventName" TEXT NOT NULL,
    "lastBlock" BIGINT NOT NULL,

    CONSTRAINT "EventSync_pkey" PRIMARY KEY ("eventName")
);

-- CreateTable
CREATE TABLE "Invest" (
    "id" SERIAL NOT NULL,
    "investor" INTEGER NOT NULL,
    "topicId" TEXT NOT NULL,
    "amount" DECIMAL(80,18) NOT NULL,
    "position" INTEGER NOT NULL,
    "nonce" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,

    CONSTRAINT "Invest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- AddForeignKey
ALTER TABLE "CreateTopic" ADD CONSTRAINT "CreateTopic_promoterId_fkey" FOREIGN KEY ("promoterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreateTopic" ADD CONSTRAINT "CreateTopic_id_fkey" FOREIGN KEY ("id") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metadata" ADD CONSTRAINT "Metadata_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invest" ADD CONSTRAINT "Invest_investor_fkey" FOREIGN KEY ("investor") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invest" ADD CONSTRAINT "Invest_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
