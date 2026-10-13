const Book = require("../models/book.model");

const getAllBook = async (req, res) => {
  try {
    const { category, author, title, isbn } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (isbn) filter.isbn = isbn;
    if (author) filter.author = new RegExp(author, "i");
    if (title) filter.title = new RegExp(title, "i");

    const books = await Book.find(filter);
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sách" });
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      isbn,
      publishedYear,
      totalCopies,
      availableCopies,
    } = req.body;

    if (!title || !author || !category || !isbn) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ các trường: title, author, category, isbn",
      });
    }

    if (totalCopies !== undefined && Number(totalCopies) < 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng bản sao không được là số âm",
      });
    }

    if (availableCopies !== undefined && Number(availableCopies) < 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng bản sao có sẵn không được là số âm",
      });
    }

    const trimmedIsbn = isbn.toString().trim();
    const existingBook = await Book.findOne({ isbn: trimmedIsbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: `ISBN '${trimmedIsbn}' đã tồn tại, vui lòng chọn ISBN khác`,
      });
    }

    const newBook = new Book({
      title,
      author,
      category,
      isbn: trimmedIsbn,
      publishedYear,
      totalCopies: totalCopies !== undefined ? Number(totalCopies) : 0,
      availableCopies:
        availableCopies !== undefined
          ? Number(availableCopies)
          : totalCopies !== undefined
          ? Number(totalCopies)
          : 0,
    });

    await newBook.save();
    res.status(201).json({
      success: true,
      message: "Tạo mới sách thành công",
      data: newBook,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "ISBN đã tồn tại" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.totalCopies !== undefined && Number(req.body.totalCopies) < 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng bản sao không được là số âm",
      });
    }

    if (req.body.availableCopies !== undefined && Number(req.body.availableCopies) < 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng bản sao có sẵn không được là số âm",
      });
    }

    if (req.body.isbn) {
      const trimmedIsbn = req.body.isbn.toString().trim();
      const existingBook = await Book.findOne({
        isbn: trimmedIsbn,
        _id: { $ne: id },
      });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: `ISBN '${trimmedIsbn}' đã tồn tại ở cuốn sách khác`,
        });
      }
      req.body.isbn = trimmedIsbn;
    }

    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sách để cập nhật" });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật sách thành công",
      data: updatedBook,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "ISBN đã tồn tại" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sách để xóa" });
    }

    res.status(200).json({
      success: true,
      message: "Xóa sách thành công",
      data: deletedBook,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ", error: error.message });
  }
};

module.exports = {
  getAllBook,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
