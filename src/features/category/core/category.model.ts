import { randomUUID } from 'crypto';

interface CategoryProps {
  id: string;
  name: string;
  icon: string;
  slug: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCategoryProps {
  name: string;
  icon: string;
  slug?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CategoryModel {
  constructor(private readonly category: CategoryProps) {}

  static create(props: CreateCategoryProps): CategoryModel {
    const date = new Date();

    return new CategoryModel({
      id: randomUUID(),
      name: props.name,
      icon: props.icon,
      slug: props.slug ?? null,
      isActive: props.isActive ?? true,
      createdAt: date,
      updatedAt: date,
    });
  }

  static restore(category: CategoryProps): CategoryModel {
    return new CategoryModel(category);
  }

  get id(): string {
    return this.category.id;
  }

  get name(): string {
    return this.category.name;
  }

  get icon(): string {
    return this.category.icon;
  }

  get slug(): string | null {
    return this.category.slug;
  }

  get isActive(): boolean {
    return this.category.isActive;
  }

  get createdAt(): Date {
    return this.category.createdAt;
  }

  get updatedAt(): Date {
    return this.category.updatedAt;
  }
}
