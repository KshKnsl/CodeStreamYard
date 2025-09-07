import { Project } from "../models/project";
import { User } from "../models/user";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { cloneOrPullRepo } from "../utils/cloner.util";
export class ProjectController {
  static async createProject(req: Request, res: Response) {
    const {
      name,
      logo_url,
      repoid,
      repo_url,
      repo_name,
      branch_url,
      description,
      languages_url,
      selected_branch,
      commithistory_url,
    } = req.body;
    const uid = (req as any).user?.id || (req as any).user?._id;
    const projectData = {
      name,
      logo_url,
      repoid,
      repo_url,
      repo_name,
      branch_url,
      description,
      languages_url,
      selected_branch,
      commithistory_url,
      ownerId: uid,
    };
    const doc = await new Project(projectData).save();
    res.status(201).send({ success: true, message: "Project created successfully", project: doc });
  }

  static async getAllProjects(req: Request, res: Response) {
    const uid = (req as any).user?.id || (req as any).user?._id;
    const projects = await Project.find({ ownerId: uid }).sort({ createdAt: -1 });
    res.status(200).send({ success: true, projects });
  }

  static async getProjectById(req: Request, res: Response) {
    const project = await Project.findById(req.params.id);
    res.status(200).send({ success: true, project });
  }

  static async updateProject(req: Request, res: Response) {
    const uid = (req as any).user?.id || (req as any).user?._id;
    const { id, name, description, logo_url, selected_branch, ...otherFields } = req.body;

    const updateFields: any = {};

    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (logo_url !== undefined) updateFields.logo_url = logo_url;
    if (selected_branch !== undefined) updateFields.selected_branch = selected_branch;

    Object.keys(otherFields).forEach((key) => {
      if (otherFields[key] !== undefined) {
        updateFields[key] = otherFields[key];
      }
    });

    const project = await Project.findOneAndUpdate(
      { _id: id || req.params.id, ownerId: uid },
      updateFields,
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Project updated successfully",
      project,
    });
  }
  static async deleteProject(req: Request, res: Response) {
    const uid = (req as any).user?.id || (req as any).user?._id;
    const { projId } = req.body;
    const deleted = await Project.deleteOne({ _id: projId, ownerId: uid });
    res.status(deleted.deletedCount > 0 ? 200 : 404).send({
      success: deleted.deletedCount > 0,
      message:
        deleted.deletedCount > 0
          ? "Project deleted successfully"
          : "Project not found or unauthorized",
    });
  }

  static async fetchProjectFilesById(req: Request, res: Response) {
    const { id } = req.params;
    const uid = (req as any).user?.id || (req as any).user?._id;

    const project = await Project.findOne({ _id: id, ownerId: uid });
    const user = await User.findById(uid);
    const projectPath = path.join(__dirname, "../../uploads/localCopyOfProject", id);

    if (project?.repo_url && user?.accessToken) {
      await cloneOrPullRepo(
        project.repo_url,
        user.accessToken,
        path.join(__dirname, "../../uploads/localCopyOfProject"),
        id
      );
    }

    const patharray =ProjectController.getAllFilePaths(projectPath, projectPath);

    res.status(200).send({
      success: true,
      message: "Project files fetched successfully",
      project,
      localPath: { patharray },
    });
  }

  private static getAllFilePaths(dirPath: string, basePath: string): string[] {
    const files: string[] = [];

    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        if (item.startsWith(".")) continue;

        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...this.getAllFilePaths(fullPath, basePath));
        } else {
          const relativePath = path.relative(basePath, fullPath).replace(/\\/g, "/");
          files.push("Files/" + relativePath);
        }
      }
    } catch (error) {
      console.error("Error reading directory:", error);
    }

    return files;
  }
}
