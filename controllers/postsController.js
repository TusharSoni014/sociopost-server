const Posts = require("../models/Posts");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");
const { mapPostOutput } = require("../utils/Utils");
const cloudinary = require("cloudinary").v2;

const createPostController = async (req, res) => {
  try {
    const { caption, postImage } = req.body;

    if (!caption || !postImage) {
      return res.send(error(400, "Caption or Post Image not Found !"));
    }
    const cloudImage = await cloudinary.uploader.upload(postImage, {
      folder: "sociopost-posts",
    });
    const owner = req._id;
    //this will come from frontend while signing, requireUser.js middleware

    const user = await User.findById(req._id);
    const post = await Posts.create({
      owner,
      caption,
      image: {
        publicId: cloudImage.public_id,
        url: cloudImage.secure_url,
      },
    });

    user.posts.push(post._id);
    await user.save();

    return res.send(success(201, {post}));
  } catch (err) {
    res.send(error(500, err.message));
  }
};

const likeAndUnlikeController = async (req, res) => {
  try {
    const { postId } = req.body;
    //user jb click krega toh post id req.body me milega

    const currentUserId = req._id;
    //current logged in user id, pushed by requireUser middleware

    const post = await Posts.findById(postId).populate('owner');
    //finding the post to like by id

    if (!post) {
      return res.send(error(404, "Post not found !"));
    }
    //agr post nhi mila toh ye aaega

    if (post.likes.includes(currentUserId)) {
      const index = post.likes.indexOf(currentUserId);
      post.likes.splice(index, 1);
    } else {
      post.likes.push(currentUserId);
    }

    await post.save();
    return res.send(success(200, { post: mapPostOutput(post, req._id) }));
    
  } catch (err) {
    return res.send(500, err.message);
  }
};

const updatePostController = async (req, res) => {
  try {
    const { postId, caption } = req.body;
    //jo post ke andr hai vo sb update ho skta h and req.body se mil skta hai
    const currentUserId = req._id;
    const post = await Posts.findById(postId);

    if (!post) {
      return res.send(error(404, "Post not found !"));
    }
    if (post.owner.toString() !== currentUserId) {
      return res.send(
        error(
          403,
          "this action cannot be performed ! only owners can update their posts."
        )
      );
    }

    if (caption) {
      post.caption = caption;
    }

    await post.save();
    return res.send(success(200, { post }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const deletePostController = async (req, res) => {
  try {
    const { postId } = req.body;
    const currentUserId = req._id;

    const post = await Posts.findById(postId);
    const currentUser = await User.findById(currentUserId);

    if (!post) {
      return res.send(error(404, "Post not found !"));
    }

    if (post.owner.toString() !== currentUserId) {
      return res.send(error(404, "only owners can delete their posts !"));
    }

    const postIndex = currentUser.posts.indexOf(postId);
    currentUser.posts.splice(postIndex, 1);
    await currentUser.save();
    await post.remove();

    return res.send(success(200, "Post deleted successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

module.exports = {
  createPostController,
  likeAndUnlikeController,
  updatePostController,
  deletePostController,
};
