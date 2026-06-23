import Repo from "../models/RepoModel.js";
import jwt from "jsonwebtoken";

export const getUserRepos = async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Get user's repos
        const repos = await Repo.find({ userId });

        return res.status(200).json({
            success: true,
            repos,
            count: repos.length
        });

    } catch (error) {
        console.error("Get User Repos Error:", error);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};