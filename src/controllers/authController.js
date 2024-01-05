const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/emails");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// define user object
const filterUserFields = (user) => {
  const filteredUser = { ...user.toObject() };
  delete filteredUser.password;
  delete filteredUser.notifications;

  return filteredUser;
};

// Signup New User

exports.signup = catchAsync(async (req, res, next) => {
  try {
    // get unregistered user
    const machineId = req.query.machineId;
    const unauthorizedUser = await User.findOne({ name: machineId });

    if (req.body.registerType === "not authorized" && unauthorizedUser) {
      return;
    }
    let packs;
    let stats;
    if (unauthorizedUser) {
      packs = unauthorizedUser.packs;
      stats = unauthorizedUser.stats;
    }

    /**
     * if user registered already with apple or with google simple change password
     */
    const definedUser = await User.findOne({ email: req.body.email });

    if (
      definedUser &&
      (definedUser.registerType === "apple" ||
        definedUser.registerType === "google")
    ) {
      const { name, password, confirmPassword } = req.body;

      if (!password || !confirmPassword) {
        return next(
          new AppError("Password and confirm password are required.", 400)
        );
      }

      if (password !== confirmPassword) {
        return next(new AppError("Passwords do not match.", 400));
      }

      // Generate a new password reset token
      definedUser.createPasswordResetToken();
      await definedUser.save({ validateBeforeSave: false });

      // Update the user's password
      definedUser.name = name;
      definedUser.password = password;
      definedUser.confirmPassword = confirmPassword;
      definedUser.passwordResetToken = undefined;
      definedUser.passwordResetExpires = undefined;
      definedUser.registerType = "email";
      definedUser.packs = packs;
      definedUser.stats = stats;
      await definedUser.save({ validateBeforeSave: false });

      if (unauthorizedUser) {
        await User.findByIdAndDelete(unauthorizedUser._id);
      }

      res.status(200).json({
        status: "success",
        newUser: definedUser,
      });
    } else {
      const newUser = await User.create({
        ...req.body,
        packs: packs,
        stats: stats,
      });

      await newUser.save({ validateBeforeSave: false });

      if (unauthorizedUser) {
        await User.findByIdAndDelete(unauthorizedUser._id);
      }

      res.status(201).json({
        status: "success",
        newUser,
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        // Create a new AppError instance with a custom error message
        const customError = new AppError(
          "This email is already in use. Please log in or use a different email.",
          400
        );
        // Pass the error to the error handling middleware
        return next(customError);
      }
      if (error.keyPattern && error.keyPattern.phone) {
        // Create a new AppError instance with a custom error message for phone
        const customError = new AppError(
          "This phone number is already in use.",
          400
        );
        // Pass the error to the error handling middleware
        return next(customError);
      }
    }
    // Pass the original error to the error handling middleware
    return next(new AppError(error.message, 400));
  }
});

// Login user

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // // 3) if everything is ok, send token to client
  // const token = await signToken(user._id);

  const filteredUser = filterUserFields(user);

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    user: filteredUser,
  });
});

// Auth with provider

exports.providerAuth = catchAsync(async (req, res, next) => {
  // get unregistered user
  const machineId = req.query.machineId;
  const unauthorizedUser = await User.findOne({ name: machineId });

  let packs;
  let stats;
  if (unauthorizedUser) {
    packs = unauthorizedUser.packs;
    stats = unauthorizedUser.stats;
  }

  const { name, email, pushNotificationToken, identityToken } = req.body;

  const provider = req.query.provider;
  const device = req.query.device;

  let findUser;
  if (provider === "apple") {
    findUser = await User.findOne(
      { appleIdentificator: identityToken } || { email: email }
    );
  } else {
    findUser = await User.findOne({ email });
  }

  if (findUser) {
    findUser.pushNotificationToken = pushNotificationToken;
    findUser.appleIdentificator = identityToken;

    // Save the findUser document
    await findUser.save({ validateBeforeSave: false });
    if (unauthorizedUser) {
      await User.findByIdAndDelete(unauthorizedUser._id);
    }

    // Use a utility function to filter fields if necessary
    let user = filterUserFields(findUser);
    res.status(200).json({
      status: "success",
      user,
    });
  } else {
    const password = uuidv4();
    const user = await User.create({
      name: name,
      email: email,
      password: password,
      confirmPassword: password,
      registerDevice: device,
      registerType: provider,
      subscription: { status: "active" },
      notifications: [],
      pushNotificationToken: pushNotificationToken,
      packs: packs,
      stats: stats,
      appleIdentificator: identityToken,
    });

    await user.save({ validateBeforeSave: false });
    if (unauthorizedUser) {
      await User.findByIdAndDelete(unauthorizedUser._id);
    }

    res.status(200).json({
      status: "success",
      user,
    });
  }
});

// forgot password

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email address.", 404));
  }

  const resetPass = uuidv4();
  const resetToken = user.createPasswordResetToken();

  user.password = resetPass;
  user.confirmPassword = resetPass;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const message = `Forgot our password? Use this temporary password ${resetPass}!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your temporary password",
      message,
      link: resetPass,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
      userId: user._id,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

// resset password

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.appleIdentificator = undefined;

  await user.save();

  // const token = await signToken(user._id);
  const filteredUser = filterUserFields(user);

  res.status(200).json({
    status: "success",
    filteredUser,
  });
});

/**
 * send verification email for register
 */

const sendVerificationEmail = async (email, verificationCode) => {
  // Set up transporter with your email credentials
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Set up the email options

  const mailOptions = {
    from: "Wordex <beautyverseservices@gmail.com>",
    to: email,
    subject: "Email Verification",
    text: `Your verification code is: ${verificationCode}`,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

// send email

exports.sendEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  // Create the verification code
  const code = (Math.random() * (999999 - 100000) + 100000).toFixed(0);
  if (user && user.registerType === "email") {
    const customError = new AppError(
      "This email is already in use. Please log in or use a different email.",
      400
    );
    // Pass the error to the error handling middleware
    return next(customError);
  } else {
    await sendVerificationEmail(req.body.email, code);
  }
  res.status(200).json({
    status: "success",
    code: code,
    user: user && user,
  });
});

// verify email

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;

  // Find the user with the provided email and code
  const user = await User.findOne({
    email,
    emailVerificationToken: code,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid verification code or email", 400));
  }

  // Set the verified field to true and clear the verification token and expiration
  user.verifiedEmail = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Generate the token and send it to the client
  const token = await signToken(user._id);
  const filteredUser = filterUserFields(user);

  res.status(200).json({
    status: "success",
    token,
    data: { newUser: filteredUser },
  });
});

// change authenticated user password
exports.changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(
      new AppError(
        "Old password, new password and confirm password are required.",
        400
      )
    );
  }

  if (newPassword !== confirmPassword) {
    return next(
      new AppError("New password and confirm password do not match.", 400)
    );
  }

  const user = await User.findById(req.params.id).select("+password");

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const isOldPasswordCorrect = await user.correctPassword(
    oldPassword,
    user.password
  );

  if (!isOldPasswordCorrect) {
    return next(new AppError("Incorrect old password.", 401));
  }

  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password changed successfully.",
  });
});
