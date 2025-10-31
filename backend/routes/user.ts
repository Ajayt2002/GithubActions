import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";
import { authenticateJwt } from "../middleware";
import dotenv from "dotenv";

dotenv.config();
const SECRET:any = process.env.SECRET
const prisma = new PrismaClient();
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    res.status(403).json({ message: "User already exists" });
  } else {
    await prisma.user.create({
      data: { username, password },
    });
    const token = jwt.sign({ username, role: "user" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User created successfully", token });
  }
});


router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (user && user.password === password) {
    const token = jwt.sign({ username, role: "user" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});


router.get("/courses", authenticateJwt, async (_req, res) => {
  const courses = await prisma.course.findMany({ where: { published: true } });
  res.json({ courses });
});


router.post("/courses/:courseId", authenticateJwt, async (req: any, res) => {
  const courseId = Number(req.params.courseId);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  const user = await prisma.user.findUnique({
    where: { username: req.user.username },
    include: { purchasedCourses: true },
  });
  if (!user) {
    return res.status(403).json({ message: "User not found" });
  }
  const alreadyPurchased = user.purchasedCourses.some(c => c.id === courseId);
  if (alreadyPurchased) {
    return res.status(400).json({ message: "Course already purchased" });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      purchasedCourses: {
        connect: { id: courseId },
      },
    },
  });

  res.json({ message: "Course purchased successfully" });
});

router.get("/purchasedCourses", authenticateJwt, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.user.username },
    include: { purchasedCourses: true },
  });

  if (!user) {
    return res.status(403).json({ message: "User not found" });
  }
  res.json({ purchasedCourses: user.purchasedCourses || [] });
});

export default router;
