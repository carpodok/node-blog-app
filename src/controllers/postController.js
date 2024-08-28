const Post = require("../models/Post");

const createPost = async (req, res) => {
  const userId = req.user.id;
  const { content, title, image, category } = req.body;
  const slug = title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");
  const newPost = new Post({
    userId,
    content,
    title,
    image,
    category,
    slug,
  });

  try {
    await newPost.save();

    res.status(201).json({
      success: true,
      newPost,
      message: "Post created successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occured in createPost controller",
      error,
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      success: true,
      totalPosts,
      totalPages,
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occured while getting post by id",
    });
  }
};

const deletePost = async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to delete this post",
    });
  }

  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({
      success: true,
      message: "The post has been deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred in deletePost controller",
      error,
    });
  }
};

const updatePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404).json({
      success: false,
      message: "Post not found",
    });
  }

  if (post.userId !== userId) {
    res.status(403).json({
      success: false,
      message: "You are not allowed to update this post",
    });
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $set: {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        image: req.body.image,
      },
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Post updated successfully!",
    updatedPost,
  });

  try {
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occured while updating post",
      error,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  deletePost,
  updatePost,
};
