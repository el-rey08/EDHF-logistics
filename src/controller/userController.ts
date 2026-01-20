import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, confirmPassword, phoneNumber, address } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !phoneNumber || !address) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      address
    });

    res.status(201).json({ message: "User created successfully", data: user });

  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};



export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      data: user.fullName
    });

  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};



export const getOneUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User fetched successfully", data: user });

  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export const getAllUser = async (req:Request, res:Response) :Promise<void> => {
  try {
    const getUsers = await userModel.find()
    if(!getUsers){
      res.status(404).json({message:"Users not found"});
      return;
    }
    res.status(200).json({message:"Users fetched successfully",data:getUsers});
  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
}

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const { fullName, address, phoneNumber } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.userId,
      { fullName, address, phoneNumber },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};


export const changePassword = async (req: any, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const user = await userModel.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Old password incorrect" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};
