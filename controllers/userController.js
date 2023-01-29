const Posts = require("../models/Posts");
const User = require("../models/User");
const { error, success } = require("../utils/responseWrapper");
const { mapPostOutput } = require("../utils/Utils");
const cloudinary = require("cloudinary").v2;

const followOrUnfollowUserController = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const currentUserId = req._id;

    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(currentUserId);

    if (currentUserId === userIdToFollow) {
      return res.send(error(409, "you cannot follow yourself !"));
    }

    if (!userToFollow) {
      return res.send(
        error(404, "Cannot find the user you are trying to follow!")
      );
    }
    if (currentUser.followings.includes(userIdToFollow)) {
      //already followed
      const followingIndex = currentUser.followings.indexOf(userIdToFollow);
      currentUser.followings.splice(followingIndex, 1);

      const followerIndex = userToFollow.followers.indexOf(currentUser);
      userToFollow.followers.splice(followerIndex, 1);

    } else {
      //not followed already
      userToFollow.followers.push(currentUserId);
      currentUser.followings.push(userIdToFollow);
    }
    await userToFollow.save();
    await currentUser.save();
    return res.send(success(200, {user:userToFollow}))
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getPostsOfFollowings = async (req, res) => {
  try {
    const currentUserId = req._id;
    const currentUser = await User.findById(currentUserId).populate(
      "followings"
    );

    const fullPosts = await Posts.find({
      owner: {
        $in: currentUser.followings,
      },
      //jin posts ka owner hmri following list me match hoga whi posts show ho jaegi, $in = inside
    }).populate("owner");

    const posts = fullPosts
      .map((item) => mapPostOutput(item, currentUserId))
      .reverse();

    const followingsIds = currentUser.followings.map((item) => item._id);
    followingsIds.push(req._id)

    const suggestions = await User.find({
      _id: {
        $nin: followingsIds, //not matching case (not in) = ($nin)
      },
    });

    return res.send(
      success(200, { ...currentUser._doc, suggestions, posts })
    );
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getMyPosts = async (req, res) => {
  try {
    const currentUserId = req._id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.send(error(404, "user not found !"));
    }

    const allUserPosts = await Posts.find({
      owner: currentUserId,
    }).populate("likes");
    //populate krne ke liye ref hona chaeye models me, jaise posts me ref:'sociopost-users' hai

    return res.send(success(200, { allUserPosts }));
  } catch (error) {
    return res.send(error(500, err.message));
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.send(error(400, "userId not found !"));
    }

    const allUserPosts = await Posts.find({
      owner: userId,
    }).populate("likes");
    //populate krne ke liye ref hona chaeye models me, jaise posts me ref:'sociopost-users' hai

    return res.send(success(200, { allUserPosts }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const currentUserId = req._id;
    const currentUser = await User.findById(currentUserId);

    //delete all posts
    await Posts.deleteMany({
      owner: currentUserId,
    });

    //remove myself from folllowers list
    currentUser.followers.forEach(async (followerId) => {
      const follower = await User.findById(followerId);
      const index = follower.followings.indexOf(currentUserId);
      follower.followings.splice(index, 1);
      await follower.save();
    });

    //remove myself from followings, followers list
    currentUser.followings.forEach(async (followingId) => {
      const followingUser = await User.findById(followingId);
      const index = followingUser.followers.indexOf(currentUserId);
      followingUser.followings.splice(index, 1);
      await followingUser.save();
    });

    //remove myself from all likes list
    const allPosts = await Posts.find();

    allPosts.forEach(async (post) => {
      const index = post.likes.indexOf(currentUser);
      post.likes.splice(index, 1);
      await post.save();
    });

    //remove currentUser
    await currentUser.remove();
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(200, "user profile deleted !"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    if (!user) {
      return res.send(error(404, "user profile not found !"));
    }
    return res.send(success(200, { user }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;

    const user = await User.findById(req._id);
    if (!user) {
      return res.send(
        error(404, "cannot update user, because its not found in out database")
      );
    }

    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (userImg) {
      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "sociopost-profile-images",
      });
      user.avatar = {
        url: cloudImg.secure_url,
        publicId: cloudImg.public_id,
      };
      await user.save();
      return res.send(success(200, { user }));
    }
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: "owner",
    });

    if (!user) {
      return res.send(error(404, req.body));
    }

    const userFullPosts = user.posts;
    const userPosts = userFullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();
    return res.send(success(200, { ...user._doc, userPosts }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

module.exports = {
  followOrUnfollowUserController,
  getPostsOfFollowings,
  getMyPosts,
  getUserPosts,
  deleteMyProfile,
  getMyInfo,
  updateMyProfile,
  getUserProfile,
};
