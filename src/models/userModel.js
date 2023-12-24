const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, 'A user must have a name'],
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  admin: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
    maxlength: [100, "Email cannot be more than 100 characters"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password cannot be less than 8 characters"],
    maxlength: [50, "Password cannot be more than 50 characters"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // works only when create user and SAVE!! not working on update
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords aren't the same!",
    },
  },
  stats: {
    type: Object,
    default: {},
  },
  dailyWordCounter: {
    type: Object,
  },
  activePack: { type: String },
  subscription: {
    activationDate: {
      type: Date,
    },
    expireDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "inactive",
      required: [true, "Subscription must have a status"],
    },
    price: { type: Number },
    variant: { type: String },
  },
  packs: {
    type: Array,
    default: [
      "Common Used Nouns A1",
      "Common Used Verbs A1",
      "Common Used Adjectives A1",
      "Common Used Adverbs A1",
    ],
  },
  cover: {
    type: String,
    default: "",
  },
  pushNotifications: { type: Boolean, default: true },
  pushNotificationToken: { type: String },
  registerMachineId: { type: String },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  lastLoginAt: {
    type: Date,
    default: Date.now(),
  },
  // passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  registerDevice: { type: String },
  registerType: { type: String },
  registerMachineId: { type: String },
  acceptPrivacy: {
    type: Boolean,
    default: false,
  },
  acceptTerms: {
    type: Boolean,
    default: false,
  },
});

// hash password
userSchema.pre("save", async function (next) {
  // only run if function was modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12;
  this.password = await bcrypt.hash(this.password, 12);

  // Delete this field
  this.confirmPassword = undefined;

  next();
});

// check email if verified
userSchema.pre("save", async function (next) {
  // Check if a verified user with the same email already exists
  const existingVerifiedUser = await User.findOne({
    email: this.email,
    verified: true,
  });
  if (existingVerifiedUser) {
    throw new Error("A verified user with this email already exists");
  }
  next();
});

// compare password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// reset password

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// define user model
const User = mongoose.model("User", userSchema);

module.exports = User;
