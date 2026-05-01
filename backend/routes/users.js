import express from "express";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../db.js";

const router = express.Router();
const TABLE_NAME = "Users";

// Simple login route
// If the user exists, it logs them in.
// If the user does not exist, it creates them.
router.post("/login", async (req, res) => {
  try {
   const { email, password } = req.body || {};

    if (!email || email.trim() === "") {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          userId: cleanEmail,
        },
      })
    );

    if (!existingUser.Item) {
      const newUser = {
        userId: cleanEmail,
        email: cleanEmail,
        password: password || "",
        createdAt: new Date().toISOString(),
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: newUser,
        })
      );

      return res.status(201).json({
        message: "New user created",
        user: {
          userId: newUser.userId,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      });
    }

    return res.json({
      message: "User logged in",
      user: {
        userId: existingUser.Item.userId,
        email: existingUser.Item.email,
        createdAt: existingUser.Item.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Could not log in user",
    });
  }
});

export default router;