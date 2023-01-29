const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");

const signupController = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      // res.status(401).send("All fields are required");
      res.send(error(400, "All fields are required"));
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      // res.status(409).send("user already exist !");
      res.send(error(400, "user already exist !"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // res.send(success(201, { user }));
    res.send(success(201, "user created successfully !"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      //return res.status(401).send("All fields are required");
      return res.send(error(401, "All fields are required"));
    }

    const user = await User.findOne({ email }).select("+password");
    //select wali line eslye lgayi h kyuki find me password nhi milega esliye schema me select true kiya h taki find me na mile. and ye lgane se mil jaega and password match kr paege.

    if (!user) {
      // return res.status(404).send("user not found !");
      return res.send(error(404, "user not found !"));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(403).send("check your password !");
    }

    const accessToken = generateAccessToken({
      _id: user._id,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id,
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true, //for security, frontend cannot acccess it now.
      secure: true, //for ssl certificate
    });

    // return res.json({ accessToken });
    return res.send(success(201, { accessToken }));
  } catch (error) {
    console.log(error);
  }
};

const logOutController = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true, //for security, frontend cannot acccess it now.
      secure: true, //for ssl certificate
    });
    res.send(success(200, "user logged out !"))
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    // return res.status(401).send("refresh token not found !");
    return res.send(error(401, "refresh token not found !"));
  }

  const refreshToken = cookies.jwt;

  // if (!refreshToken) {
  //   return res.status(401).send("refresh token not found or expired !");
  // }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );

    const _id = decoded._id;
    const accessToken = generateAccessToken({ _id });

    // return res.status(201).json({ accessToken });
    return res.send(success(201, { accessToken }));
  } catch (error) {
    console.log(error);
    // return res.status(401).send("Invalid refresh token key !");
    return res.send(error(401, "Invalid refresh token key !"));
  }
};

//----------- private functions -----------//

const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};
const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "1y",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  signupController,
  loginController,
  refreshAccessTokenController,
  logOutController,
};
