const User = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Word = require("../models/wordModel");

// get one user
exports.getUser = catchAsync(async (req, res, next) => {
  const userObj = await User.findById(req.params.id);

  if (!userObj) {
    return next(new AppError("User not found with this id", 404));
  }

  const machineId = req.query.machineId;
  const unauthorizedUser = await User.findOne({ name: machineId });
  if (unauthorizedUser) {
    await User.findByIdAndDelete(unauthorizedUser._id);
  }

  res.status(200).json({
    status: "success",
    data: { user: userObj },
  });
});

// Create New User
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});
// update user
exports.updateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  let machineId = req.query.machineId;

  try {
    let user;
    if (userId !== "undefined") {
      user = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
        runValidators: true,
      });
    }

    // If user not found by id, try finding by machineId
    if (!user && machineId) {
      user = await User.findOneAndUpdate({ name: machineId }, req.body, {
        new: true,
        runValidators: true,
      });
    }

    if (!user) {
      return next(
        new AppError("User not found with this id or machineId", 404)
      );
    }

    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        return next(
          new AppError(
            "This email is already in use. Please log in or use a different email.",
            400
          )
        );
      }
      if (error.keyPattern && error.keyPattern.phone) {
        return next(new AppError("This phone number is already in use.", 400));
      }
    }
    return next(new AppError(error.message, 400));
  }
});

// delete user
exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  const userId = req.params.id;

  res.status(204).json({
    status: "success",
    data: null,
  });
});
