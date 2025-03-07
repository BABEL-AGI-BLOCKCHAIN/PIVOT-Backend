import uploadOnPinata from "../utils/pinata.js";
import prisma from "../utils/prisma.js";
import {safeDecimal} from "../utils/validateDecimal.js";
import { provider } from "../utils/provider.js";

const createTopic = async (req, res) => {
  try {
    const { topicId, promoter, investment, position, tokenAddress, nonce, chainId, transactionHash } = req.body;

    const user = await prisma.user.upsert({
      where: { walletAddress: promoter },
      update: {},
      create: { walletAddress: promoter },
    });

    if (!user) {
      return res.status(400).json({ error: "Promoter does not exist" });
    }

    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (existingTopic) {
      return res.status(200).json({
        message: "Topic already exists",
        topic: existingTopic,
      });
    }

    const decimalInvestment = safeDecimal(investment);

    const result = await prisma.$transaction(async (tx) => {
      const newTopic = await tx.topic.create({
        data: {
          id: topicId,
          totalInvestment: decimalInvestment,
          currentPosition: position+1,
        },
      });

      const newCreateTopic = await tx.createTopic.create({
        data: {
          promoter: { connect: { walletAddress: user.walletAddress } },
          investment: decimalInvestment,
          position,
          tokenAddress,
          nonce,
          transactionHash,
          chainId,
          topic: { connect: { id: topicId } },
        },
      });

      return { newTopic, newCreateTopic };
    });

    res.status(201).json({
      topic: result.newTopic,
      createTopic: result.newCreateTopic,
      message: "Topic created successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

const getTopics = async (_, res) => {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        createTopic: true,
        metadata: true,
        comments: true,
        invests: true,
      },
      orderBy: {
        createTopic: {
          createdAt: 'asc'
        }
      }
    });

    res.status(200).json({
      topics,
      message: "Topics retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

const getTopicsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const topics = await prisma.topic.findMany({
      where: {
        createTopic: {
          promoterId: userId,
        },
      },
      include: {
        createTopic: true,
        metadata: true,
        comments: true,
        invests: true,
      },
      orderBy: {
        createTopic: {
          createdAt: 'asc',
        },
      },
    });
    
    res.status(200).json({
      topics,
      message: "Topics retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

const getTopicById = async (req, res) => {
  try {
    const topicId = req.params.topicId;
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        createTopic: true,
        metadata: true,
        comments: true,
        invests: true,
      },
    });
    
    if (!topic) {
      throw new Error("Topic not found");
    }
    
    res.status(200).json({
      topic,
      message: "Topic retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

const invest = async (req, res) => {
  try {
    const { investor, topicId, amount, position, nonce, chainId, transactionHash } = req.body;

    const topic = await prisma.createTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return res.status(400).json({ error: "Topic does not exist" });
    }

    const user = await prisma.user.upsert({
      where: { walletAddress: investor },
      update: {},
      create: { walletAddress: investor },
    });

    const decimalAmount = safeDecimal(amount);

    const blockNumber = BigInt(await provider.getBlockNumber());

    const investment = await prisma.invest.create({
      data: {
        user: { connect: { walletAddress: user.walletAddress } },
        topic: { connect: { id: topic.id } },
        amount: decimalAmount,
        position,
        nonce,
        transactionHash,
        chainId,
        blockNumber,
      },
    });

    const currentInvestment = safeDecimal(topic.investment);
    const updatedInvestment = currentInvestment.plus(decimalAmount);

    if (!updatedInvestment.isFinite()) {
      return res.status(400).json({ error: "Resulting investment is invalid" });
    }

    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        totalInvestment: updatedInvestment,
        currentPosition: position+1,
      },
    });

    res.status(201).json({
      investment,
      message: "Investment created successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

const updateTopic = async (req, res) => {
  try {
    const { topicId, topicTitle, topicContent, topicHash } = req.body;

    const imageLocalPath = req.files?.image?.[0]?.path;
    let imageUrl = null;
    if (imageLocalPath) {
      const uploadedImage = await uploadOnPinata(imageLocalPath);
      imageUrl = uploadedImage;
    }

    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existingTopic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    const metadata = await prisma.metadata.upsert({
      where: { topicId },
      update: {
        topicTitle,
        topicContent,
        topicHash,
        imageUrl,
      },
      create: {
        topicTitle,
        topicContent,
        topicHash,
        imageUrl,
        topic: { connect: { id: topicId } },
      },
    });

    res.status(201).json({
      metadata,
      message: "Metadata updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

export  {getTopics, getTopicsByUser, getTopicById, createTopic, invest, updateTopic};