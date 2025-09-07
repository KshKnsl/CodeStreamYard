import { Project } from "../models/project";
import { Request, Response } from "express";

const genLink = (len = 5) =>
  Array.from(
    { length: len },
    () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
        Math.floor(Math.random() * 62)
      ]
  ).join("");
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
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send({ success: true, message: "Project updated", project });
  }

  static async updateBranch(req: Request, res: Response) {
    const uid = (req as any).user?.id || (req as any).user?._id;
    const { id: projId, selected_branch } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: projId, ownerId: uid },
      { selected_branch },
      { new: true }
    );
    res.status(200).send({ success: true, message: "Selected branch updated", project });
  }

  static async updateDetails(req: Request, res: Response) {
    const uid = (req as any).user?.id || (req as any).user?._id;
    const { id, name, description, logo_url } = req.body;
    const fields = Object.fromEntries(
      Object.entries({ name, description, logo_url }).filter(([_, v]) => v !== undefined)
    );
    const project = await Project.findOneAndUpdate({ _id: id, ownerId: uid }, fields, {
      new: true,
    });
    res.status(200).send({ success: true, message: "Project details updated", project });
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
    const project = await Project.findById(id);
    if (!project) return res.status(404).send({ success: false, message: "Project not found" });

    // FILEBASE logic removed. Use local file fetch instead.
    res.status(200).send({ success: true, message: "Project files fetched successfully", project });
  }
}
