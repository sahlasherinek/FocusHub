import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type TodoStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface ITodo extends Document {
  title: string;
  status: TodoStatus;
  priority: 'Low' | 'Medium' | 'High';
  user: Types.ObjectId;
}

const todoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

const Todo: Model<ITodo> = mongoose.model<ITodo>('Todo', todoSchema);
export default Todo;