const Loan = require("../models/loan.model");
const Member = require("../models/member.model");
const Book = require("../models/book.model");

const getAllLoan = async (req, res) => {
  try {
    const { status, member_id } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (member_id) filter.member_id = member_id;

    const loans = await Loan.find(filter)
      .populate("member_id", "fullName email phone membershipType")
      .populate("items.book_id", "title author category isbn");

    res.status(200).json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findById(id)
      .populate("member_id", "fullName email phone membershipType")
      .populate("items.book_id", "title author category isbn");

    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu mượn" });
    }

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const createLoan = async (req, res) => {
  try {
    const { member_id, items, borrowDate, dueDate, returnDate, status } = req.body;

    if (!member_id) {
      return res.status(400).json({ success: false, message: "member_id là bắt buộc" });
    }
    const member = await Member.findById(member_id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thành viên" });
    }
    if (member.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Thành viên hiện đang bị khóa, không thể mượn sách",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách sách mượn phải là mảng và không được để trống",
      });
    }

    for (const item of items) {
      if (!item.book_id) {
        return res.status(400).json({ success: false, message: "book_id trong items là bắt buộc" });
      }
      const qty = Number(item.quantity);
      if (!qty || qty < 1) {
        return res.status(400).json({
          success: false,
          message: "Số lượng mượn phải là số nguyên >= 1",
        });
      }

      const book = await Book.findById(item.book_id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sách với id: ${item.book_id}`,
        });
      }

      if (book.availableCopies < qty) {
        return res.status(400).json({
          success: false,
          message: `Sách '${book.title}' chỉ còn ${book.availableCopies} bản có sẵn, không đủ để mượn ${qty} bản`,
        });
      }
    }

    if (!dueDate) {
      return res.status(400).json({ success: false, message: "dueDate là bắt buộc" });
    }

    const loanStatus = status || "Borrowing";

    if (loanStatus !== "Returned") {
      for (const item of items) {
        await Book.findByIdAndUpdate(item.book_id, {
          $inc: { availableCopies: -Number(item.quantity) },
        });
      }
    }

    const newLoan = new Loan({
      member_id,
      items,
      borrowDate: borrowDate || new Date(),
      dueDate,
      returnDate: returnDate || null,
      status: loanStatus,
    });

    await newLoan.save();

    res.status(201).json({
      success: true,
      message: "Tạo phiếu mượn thành công",
      data: newLoan,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const existingLoan = await Loan.findById(id);
    if (!existingLoan) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu mượn để cập nhật" });
    }

    if (existingLoan.status !== "Returned" && req.body.status === "Returned") {
      for (const item of existingLoan.items) {
        await Book.findByIdAndUpdate(item.book_id, {
          $inc: { availableCopies: Number(item.quantity) },
        });
      }
      if (!req.body.returnDate) {
        req.body.returnDate = new Date();
      }
    }

    if (
      existingLoan.status === "Returned" &&
      req.body.status &&
      req.body.status !== "Returned"
    ) {
      for (const item of existingLoan.items) {
        await Book.findByIdAndUpdate(item.book_id, {
          $inc: { availableCopies: -Number(item.quantity) },
        });
      }
    }

    const updatedLoan = await Loan.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật phiếu mượn thành công",
      data: updatedLoan,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findById(id);
    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu mượn để xóa" });
    }

    if (loan.status !== "Returned") {
      for (const item of loan.items) {
        await Book.findByIdAndUpdate(item.book_id, {
          $inc: { availableCopies: Number(item.quantity) },
        });
      }
    }

    await Loan.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Xóa phiếu mượn thành công",
      data: loan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

module.exports = {
  getAllLoan,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
};