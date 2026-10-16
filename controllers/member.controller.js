const Member = require("../models/member.model");
const Loan = require("../models/loan.model");

const getAllMembers = async (req, res) => {
  try {
    const { membershipType, isActive, fullName, email } = req.query;
    const filter = {};

    if (membershipType) filter.membershipType = membershipType;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (fullName) filter.fullName = new RegExp(fullName, "i");
    if (email) filter.email = new RegExp(email, "i");

    const members = await Member.find(filter);
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findById(id);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thành viên" });
    }

    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const createMember = async (req, res) => {
  try {
    const { fullName, email, phone, membershipType, isActive } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ các trường: fullName, email, phone",
      });
    }

    if ([fullName, email, phone].some((value) => typeof value !== "string" || !value.trim())) {
      return res.status(400).json({
        success: false,
        message: "fullName, email và phone phải là chuỗi không rỗng",
      });
    }

    const validMembershipTypes = ["Student", "Teacher", "Guest"];
    if (membershipType && !validMembershipTypes.includes(membershipType)) {
      return res.status(400).json({
        success: false,
        message: `membershipType không hợp lệ. Chỉ chấp nhận: ${validMembershipTypes.join(", ")}`,
      });
    }

    const trimmedEmail = email.toString().trim().toLowerCase();
    const existingMember = await Member.findOne({ email: trimmedEmail });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: `Email '${trimmedEmail}' đã tồn tại, vui lòng chọn email khác`,
      });
    }

    const newMember = new Member({
      fullName: fullName.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      membershipType: membershipType || "Student",
      isActive: isActive !== undefined ? isActive : true,
    });

    await newMember.save();
    res.status(201).json({
      success: true,
      message: "Tạo mới thành viên thành công",
      data: newMember,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email đã tồn tại" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (["fullName", "email", "phone"].some(
      (field) => req.body[field] !== undefined &&
        (typeof req.body[field] !== "string" || !req.body[field].trim())
    )) {
      return res.status(400).json({
        success: false,
        message: "fullName, email và phone phải là chuỗi không rỗng",
      });
    }

    const validMembershipTypes = ["Student", "Teacher", "Guest"];
    if (
      req.body.membershipType &&
      !validMembershipTypes.includes(req.body.membershipType)
    ) {
      return res.status(400).json({
        success: false,
        message: `membershipType không hợp lệ. Chỉ chấp nhận: ${validMembershipTypes.join(", ")}`,
      });
    }

    if (req.body.email) {
      const trimmedEmail = req.body.email.toString().trim().toLowerCase();
      const existingMember = await Member.findOne({
        email: trimmedEmail,
        _id: { $ne: id },
      });
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: `Email '${trimmedEmail}' đã tồn tại ở thành viên khác`,
        });
      }
      req.body.email = trimmedEmail;
    }

    const updatedMember = await Member.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMember) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thành viên để cập nhật" });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thành viên thành công",
      data: updatedMember,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email đã tồn tại" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const activeLoan = await Loan.findOne({
      member_id: id,
      status: { $in: ["Borrowing", "Overdue"] },
    });
    if (activeLoan) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa thành viên đang có sách mượn chưa trả",
      });
    }

    const deletedMember = await Member.findByIdAndDelete(id);

    if (!deletedMember) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy thành viên để xóa" });
    }

    res.status(200).json({
      success: true,
      message: "Xóa thành viên thành công",
      data: deletedMember,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
