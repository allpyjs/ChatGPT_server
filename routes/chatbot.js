const express = require("express");
const {
  getReponse,
  makeUserFolder,
  getHistoryTreeData,
  updateHistoryTreeData,
  getPromptTreeData,
  updatePromptTreeData,
  addNewChat,
  addNewFolder,
  getHistoryById,
  addNewPromptFolder,
  addNewPrompt,
  getPromptById,
  savePrompt,
  // getTokenCount,
  saveHistory,
  getUltimatePromptById,
  updateUltimatePromptTreeData,
  getSystemPromptsTree,
  addUltimateNewPromptFolder,
  addUltimateNewPrompt,
  saveUltimatePrompt,
  convertPrompt,
} = require("../controllers/chatbot");
const router = express.Router();

router.route("/getresponse").post(getReponse);
router.route("/makeuserfolder").post(makeUserFolder);

router.route("/gethistorytreedata").post(getHistoryTreeData);
router.route("/updatehistorytreedata").post(updateHistoryTreeData);
router.route("/addnewchat").post(addNewChat);
router.route("/addnewfolder").post(addNewFolder);
router.route("/gethistorybyid").post(getHistoryById);

router.route("/getprompttreedata").post(getPromptTreeData);
router
  .route("/updateultimateprompttreedata")
  .post(updateUltimatePromptTreeData);
router.route("/updateprompttreedata").post(updatePromptTreeData);
router.route("/addnewprompt").post(addNewPrompt);
router.route("/addnewpromptfolder").post(addNewPromptFolder);
router.route("/addultimatenewpromptfolder").post(addUltimateNewPromptFolder);
router.route("/getpromptbyid").post(getPromptById);
router.route("/getultimatepromptbyid").post(getUltimatePromptById);
router.route("/saveprompt").post(savePrompt);
router.route("/saveultimateprompt").post(saveUltimatePrompt);
router.route("/convertprompt").post(convertPrompt);
// router.route("/token").post(getTokenCount);
router.route("/savehistory").post(saveHistory);
router.route("/getsysprompttree").post(getSystemPromptsTree);
router.route("/addultimatenewprompt").post(addUltimateNewPrompt);

module.exports = router;
