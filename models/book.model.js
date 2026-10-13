const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: { type: String, required: [true, "Title là bắt buộc"] },
    author: { type: String, required: [true, "Author là bắt buộc"] },
    category: { type: String, required: [true, "Category là bắt buộc"] },
    isbn: {
      type: String,
      required: [true, "ISBN là bắt buộc"],
      unique: true,
      trim: true,
    },
    publishedYear: { type: Number },
    totalCopies: {
      type: Number,
      min: [0, "Số lượng bản sao không được là số âm"],
      default: 0,
    },
    availableCopies: {
      type: Number,
      min: [0, "Số lượng bản sao có sẵn không được là số âm"],
      default: 0,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
