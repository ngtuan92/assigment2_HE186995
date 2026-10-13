const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loanSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    member_id: {
      type: String,
      ref: "Member",
      required: [true, "member_id là bắt buộc"],
    },
    items: [
      {
        book_id: {
          type: String,
          ref: "Book",
          required: [true, "book_id là bắt buộc"],
        },
        quantity: {
          type: Number,
          required: [true, "quantity là bắt buộc"],
          min: [1, "Số lượng mượn tối thiểu là 1"],
        },
      },
    ],
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "dueDate là bắt buộc"],
    },
    returnDate: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["Borrowing", "Returned", "Overdue"],
        message: "status phải là 'Borrowing', 'Returned' hoặc 'Overdue'",
      },
      default: "Borrowing",
    },
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", loanSchema);

module.exports = Loan;
