import processRepo from "../processes/processRepo.js"
import { v4 as uuidv4 } from "uuid";
import Repo from "../models/RepoModel.js"

export const urlprocessor = async (req, res) => {
    try {
    const gitHubLink = req.body.link;

    if (!gitHubLink) {
      return res.status(400).json({
        message: "Github link is required",
      });
    }

    const jobId = uuidv4();

    await Repo.create({
      jobId,
      repoLink: gitHubLink,
    });

    processRepo(gitHubLink, jobId).catch((err) => {
      console.error("ProcessRepo Error:", err);
    });

    return res.status(200).json({ jobId });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to process repository",
    });
  }
}