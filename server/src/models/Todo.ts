import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  user: Types.ObjectId;
}

const todoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // speeds up "find all todos for this user" queries
    },
  },
  { timestamps: true }
);

const Todo: Model<ITodo> = mongoose.model<ITodo>('Todo', todoSchema);
export default Todo;