const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");
//crypto.randomBytes(64).toString('hex') generate random hex key using node cli

module.exports = (req, res, next) => {
  if (
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    // return res.status(401).send("Access token required !");
    return res.send(error(401, "Access token required !"));
  }

  const accessToken = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_PRIVATE_KEY
    );

    req._id = decoded._id; //id field req ke andr add hue h.

    const user = User.findById(req._id)
    if(!user){
      return res.send(error(404,"User not found !"))
    }
    next();
  } catch (err) {
    console.log(err);
    // return res.status(401).send("Invalid access token key !");
    return res.send(error(401, "Invalid access token key !"));
  }
};
