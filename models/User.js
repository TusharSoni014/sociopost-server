const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, //it will not show when finding user in mongo database
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    avatar: {
      publicId: String,
      url: String,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId, //array of objectid of users
        ref: "sociopost-users",
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sociopost-users",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        //jb bhi hm object id use krte h reference imp hai.
        ref: "sociopost-posts",
        //eska reference post model wala hai
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("sociopost-users", userSchema);
