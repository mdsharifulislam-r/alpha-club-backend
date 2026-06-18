import { model, Schema } from 'mongoose';
import { ICategory, CategoryModel } from './category.interface';

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
    },
  },
  { timestamps: true },
);

categorySchema.pre('save', function (next) {
  this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  next();
});

categorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;

  if (update?.name) {
    update.slug = update.name.toLowerCase().replace(/\s+/g, '-');
  }

  next();
});
export const Category = model<ICategory, CategoryModel>(
  'Category',
  categorySchema,
);
