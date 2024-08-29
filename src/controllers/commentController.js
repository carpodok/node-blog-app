const Comment = require("../models/Comment");

const createComment = async (req, res) => {
  try {
    const { content, postId, userId } = req.body;

    if (userId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to create this comment",
      });
    }

    const comment = new Comment({
      content,
      postId,
      userId,
    });

    await comment.save();

    res.status(201).json({
      success: true,
      message: "Comment created successfully!",
      comment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occured while creating a comment",
      error,
    });
  }
};

const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (commentId !== comment.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this comment",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully!",
      updatedComment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occured while updating comment",
      error,
    });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    let comments, totalComments;

    if (!postId) {
      comments = await Comment.find();
      totalComments = await Comment.countDocuments();
    } else {
      comments = await Comment.find({ postId: postId }).sort({ createdAt: -1 });
      totalComments = await Comment.countDocuments();
    }

    res.status(200).json({
      success: true,
      totalComments,
      comments,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "An error occured while getting all comments",
      error,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to delete this comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({
      success: true,
      message: "Comment has been deleted",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "An error occured while deleting a comment",
      error,
    });
  }
};

const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const userId = req.user.id;
    const userIndex = comment.likes.indexOf(userId);

    if (userIndex === -1) {
      comment.likeCount += 1;
      comment.likes.push(userId);
    } else {
      comment.likeCount -= 1;
      comment.likes.splice(userIndex, 1);
    }

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Like status of the comment has been updated",
      comment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occured while liking a comment",
      error: error,
    });
  }
};

module.exports = {
  createComment,
  getComments,
  deleteComment,
  editComment,
  likeComment,
};
