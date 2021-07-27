const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  id: {
    type: String,
    required: true,
  },

  anilist: {
    type: String,
    required: true,
  },
});

const User = new model("User", UserSchema);

module.exports = User;
