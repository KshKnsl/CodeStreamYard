import { Request, Response } from "express";
import { User, UserInterface } from "../models/user";
import { UserController } from "./user.controller";

interface AuthResponse {
  error?: string;
  message?: string;
  success?: boolean;
  isAuthenticated?: boolean;
  user?: Partial<UserInterface>;
}

export class AuthController {

  static async handleGithubCallback(req: Request, res: Response): Promise<void> {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const user = req.user as UserInterface;
    await UserController.updateLastLogin(user.id);
    res.redirect(`${clientUrl}/dashboard`);
  }

  static async getStatus(req: Request, res: Response): Promise<void> {
    if (!req.isAuthenticated()) {
      console.log("Not authenticated - sending 401");
      res.status(401).json({
        isAuthenticated: false,
        user: undefined,
        message: "Not authenticated"
      } satisfies AuthResponse);
      return;
    }

    const user = req.user as UserInterface;
    res.json({ message: "Authenticated", user });
  }

  static async logout(req: Request, res: Response): Promise<void> {
    req.logout(() => {
      res.json({ success: true, message: "Logged out successfully" });
    });
  }

  static async deleteAccount(req: Request, res: Response): Promise<void> {
    const userId = (req.user as UserInterface).id;
    await User.findByIdAndDelete(userId);
    req.logout(() => {
      res.json({ success: true, message: "Account deleted successfully" });
    });
  }
}
