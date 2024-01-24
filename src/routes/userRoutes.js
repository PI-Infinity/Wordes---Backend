const express = require("express");
const router = express.Router();

const authentication = require("../controllers/authController");
const users = require("../controllers/userController");
const stats = require("../controllers/statsContoroller");
const admin = require("../controllers/adminController");

// const chats = require('../controllers/messageController');

// authentication
router.post("/signup", authentication.signup);
router.post("/login", authentication.login);
router.post("/providerauth", authentication.providerAuth);
router.post("/forgotPassword", authentication.forgotPassword);
router.patch("/resetPassword/:token", authentication.resetPassword);
router.patch("/changePassword/:id", authentication.changePassword);
router.post("/verifyEmail", authentication.verifyEmail);
router.post("/sendVerifyEmail", authentication.sendEmail);

// users
router
  .route("/users/:id")
  .get(users.getUser)
  .patch(users.updateUser)
  .delete(users.deleteUser)
  .delete(users.deleteUnauthUser);
router.route("/users/unauth/:deleteId").delete(users.deleteUnauthUser);

// stats
router.route("/users/:id/stats/addword").patch(stats.addWordStat);
router.route("/users/:id/stats/percents").get(stats.getPercents);
router.route("/users/:id/counter").patch(stats.pressCounter);

// words
router.route("/words").get(stats.getWord);
router.route("/words").post(stats.addWord);

// admin
router.route("/admin/stats").get(admin.getUsers);
router.route("/admin/stats/user/:email").get(admin.getUserStats);
router.route("/admin/stats/charts").get(admin.getCharts);

module.exports = router;
