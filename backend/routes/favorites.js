import express from "express";
import {
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../db.js";

const router = express.Router();
const TABLE_NAME = "FavoriteStocks";

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      ticker,
      companyName,
      industry,
      growthRate,
      peRatio,
      growthOverPe,
    } = req.body || {};

    if (!userId || !ticker) {
      return res.status(400).json({
        error: "userId and ticker are required",
      });
    }

    const favorite = {
      userId: userId.toLowerCase(),
      ticker: ticker.toUpperCase(),
      companyName: companyName || "Unknown Company",
      industry: industry || "Unknown",
      growthRate: Number(growthRate) || 0,
      peRatio: Number(peRatio) || 0,
      growthOverPe: Number(growthOverPe) || 0,
      dateAdded: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: favorite,
      })
    );

    res.status(201).json({
      message: "Stock added to favorites",
      favorite,
    });
  } catch (error) {
    console.error("Error saving favorite:", error);
    res.status(500).json({
      error: "Could not save favorite stock",
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId.toLowerCase(),
        },
      })
    );

    res.json(result.Items || []);
  } catch (error) {
    console.error("Error getting favorites:", error);
    res.status(500).json({
      error: "Could not get favorite stocks",
    });
  }
});

router.get("/:userId/industry/:industry", async (req, res) => {
  try {
    const { userId, industry } = req.params;

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "IndustryIndex",
        KeyConditionExpression: "userId = :userId AND industry = :industry",
        ExpressionAttributeValues: {
          ":userId": userId.toLowerCase(),
          ":industry": industry,
        },
      })
    );

    res.json(result.Items || []);
  } catch (error) {
    console.error("Error filtering favorites:", error);
    res.status(500).json({
      error: "Could not filter favorites by industry",
    });
  }
});

router.delete("/:userId/:ticker", async (req, res) => {
  try {
    const { userId, ticker } = req.params;

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          userId: userId.toLowerCase(),
          ticker: ticker.toUpperCase(),
        },
      })
    );

    res.json({
      message: "Favorite stock deleted",
    });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({
      error: "Could not delete favorite stock",
    });
  }
});

export default router;