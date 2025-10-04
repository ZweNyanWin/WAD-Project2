const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy' 
  },
  ingredients: [{ 
    name: { type: String, required: true }, 
    qty: { type: String, required: true }, 
    unit: { type: String, required: true } 
  }],
  steps: [{
    type: String,
    required: true
  }],
  photo: { type: String }, // URL/path to uploaded photo
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

module.exports = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema)
