const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sociopost-users",
      required: true,
    },
    image: {
      publicId: String,
      url: String,
    },
    caption: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sociopost-users",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("sociopost-posts", postSchema);
