import mongoose from "mongoose";

interface IAttributeDefinition {
  name: string;
  type: "text" | "number" | "boolean" | "select" | "multiselect";
  required: boolean;
  options: string[];
  defaultValue?: any;
}

const attributeDefinitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["text", "number", "boolean", "select", "multiselect"],
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: {
    type: [String],
    default: [],
    validate: {
      validator: function (this: IAttributeDefinition, v: string[]) {
        // Only require options for select and multiselect types
        if (this.type === "select" || this.type === "multiselect") {
          return Array.isArray(v) && v.length > 0;
        }
        return true;
      },
      message: "Options are required for select and multiselect types",
    },
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined,
  },
});

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a category name"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a category description"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    attributes: {
      type: [attributeDefinitionSchema],
      default: [],
      validate: {
        validator: function (attrs: IAttributeDefinition[]) {
          // Check for unique attribute names
          const names = attrs.map((attr) => attr.name);
          return new Set(names).size === names.length;
        },
        message: "Attribute names must be unique within a category",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from name before saving
categorySchema.pre("save", function (next) {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  next();
});

export const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
