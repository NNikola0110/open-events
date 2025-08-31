import { Request, Response } from 'express';
import { AppDataSource } from '../db';
import { Category } from '../model/categoriModel';
import { CategorySchema } from '../utils/validation';


const categoryRepo = AppDataSource.getRepository(Category);

// POST /ems/categories
export async function addCategory(req:Request, res:Response){
  try {
    const parsed = CategorySchema.parse(req.body);

    // proveri da li postoji već
    const exists = await categoryRepo.findOne({ where: { name: parsed.name } });
    if (exists) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

     const category = categoryRepo.create({
      name: parsed.name,
      description: parsed.description,
     });
    await categoryRepo.save(category);

    res.status(201).json(category);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getCategories(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const [categories, total] = await categoryRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.json({
      data: categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function deleteCategory(req: Request, res: Response) {
  try {
    const idParam = req.params.id;
    if (!idParam) {
      return res.status(400).json({ message: "User ID param is required" });
    }
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await categoryRepo.findOne({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await categoryRepo.remove(category);

    return res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


//export async function updateCat(req:Request, res:Response){
//  try {
//    const parsed = CategorySchema.parse(req.body);
//
//    const idParam = req.params.id;
//    if (!idParam) {
//      return res.status(400).json({ message: "Category ID param is required" });
//    }
//    const userId = parseInt(idParam);
//    if (isNaN(userId)) {
//    return res.status(400).json({ message: "Invalid category ID" });
//    }
//
//    const category = await categoryRepo.findOne({ where: { id: parseInt(req.params.id) } });
//    if (!category) {
//      return res.status(404).json({ message: "Category not found" });
//    }
//
//    // proveri da li već postoji nova vrednost imena
//    const exists = await categoryRepo.findOne({ where: { name: parsed.name } });
//    if (exists && exists.id !== category.id) {
//      return res.status(400).json({ message: "Another category with this name already exists" });
//    }
//
//    category.name = parsed.name;
//    await categoryRepo.save(category);
//
//    res.json(category);
//  } catch (err: any) {
//    res.status(400).json({ message: err.message });
//  }
//}

