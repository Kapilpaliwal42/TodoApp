import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true, 
    minlength: 1 
  },
  completed: {
    type: Boolean,
    default: false 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now 
  }
});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
