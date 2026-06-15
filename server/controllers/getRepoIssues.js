import axios from "axios";
import Repo from "../models/RepoModel.js";

const getRepoIssues = async (req, res) => {
  try {
     console.log("part 1");
     
    const { jobId } = req.params;

    const repo = await Repo.findOne({ jobId });

    if (!repo) {
      return res.status(404).json({
        message: "Repository not found",
      });
    }

    const githubLink = repo.repoLink;

    // https://github.com/facebook/react
    const match = githubLink.match(
      /github\.com\/([^/]+)\/([^/]+)/
    );

    if (!match) {
      return res.status(400).json({
        message: "Invalid GitHub URL",
      });
    }
   console.log("is this part");
   
    const owner = match[1];
    const repoName = match[2];

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/issues`
    );
    console.log("backend response:",response);
    
    const issues = response.data.filter(
  issue => !issue.pull_request
);
    return res.status(200).json(issues);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Issues not fetched",
    });
  }
};

export default getRepoIssues;