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

const getLoansByMemberId = async (req, res) => {
  try {
    const loans = await Loan.find({ member_id: req.params.memberId })
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
  getLoansByMemberId,
  deleteLoan,
};
