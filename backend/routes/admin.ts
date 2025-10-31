import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";
import { authenticateJwt } from "../middleware";
import dotenv from "dotenv";

dotenv.config();
const SECRET:any = process.env.SECRET

const prisma = new PrismaClient();
const router = express.Router();


router.get("/me", authenticateJwt, async (req: any, res) => {
  const admin = await prisma.admin.findUnique({
    where: { username: req.user.username },
  });
  if (!admin) {
    res.status(403).json({ msg: "Admin doesn't exist" });
    return;
  }
  res.json({ username: admin.username });
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const existingAdmin = await prisma.admin.findUnique({ where: { username } });
  if (existingAdmin) {
    res.status(403).json({ message: "Admin already exists" });
    return;
  }
  const newAdmin = await prisma.admin.create({
    data: { username, password },
  });
  const token = jwt.sign({ username, role: "admin" }, SECRET, {
    expiresIn: "1h",
  });
  res.json({ message: "Admin created successfully", token });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { username } });
  console.log(admin)
  if (admin && admin.password === password) {
    console.log("hi there")
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});

router.post("/courses", authenticateJwt, async (req, res) => {
  const course = await prisma.course.create({
    data: req.body,
  });
  res.json({ message: "Course created successfully", courseId: course.id });
});

router.put("/courses/:courseId", authenticateJwt, async (req, res) => {
  const courseId = Number(req.params.courseId);
  try {
    const course = await prisma.course.update({
      where: { id: courseId },
      data: req.body,
    });
    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(404).json({ message: "Course not found" });
  }
});

router.get("/courses", authenticateJwt, async (_req, res) => {
  const courses = await prisma.course.findMany();
  res.json({ courses });
});

router.get("/course/:courseId", authenticateJwt, async (req, res) => {
  const courseId = Number(req.params.courseId);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    res.status(404).json({ message: "Course not found" });
    return;
  }

  res.json({ course });
});

export default router;
