const OpenAI = require("openai");
const path = require("path");
const fs = require("fs");
const util = require("util");
// const { Tiktoken } = require("@dqbd/tiktoken/lite");
// const cl100k_base = require("@dqbd/tiktoken/encoders/cl100k_base.json");

// const encoding = new Tiktoken(
//   cl100k_base.bpe_ranks,
//   cl100k_base.special_tokens,
//   cl100k_base.pat_str
// );

const { v4: uuidv4 } = require("uuid");

const davinci = require("./../utils/davinci");
const TreeNode = require("./../models/TreeNode");

const saveHistory = async (req, res, next) => {
  try {
    const { message, response, email, id } = req.body;

    let newJson1 = {
      role: "user",
      content: message,
    };
    let newJson2 = {
      role: "assistant",
      content: response,
    };
    if (id !== null) {
      filePath = `./../folders/${email}/history/${id}.json`;
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("An error occurred while reading the file:", err);
        } else {
          try {
            const jsonData = JSON.parse(data);
            jsonData.push(newJson1);
            jsonData.push(newJson2);
            const updatedData = JSON.stringify(jsonData, null, 2);
            fs.writeFile(filePath, updatedData, (writeErr) => {
              if (writeErr) {
                console.error(
                  "An error occurred while writing the file:",
                  writeErr
                );
              } else {
                console.log("Value added to the JSON array in the file.");
              }
            });
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
          }
        }
      });
    }

    return res.status(200).json({ success: true, response: response });
  } catch (error) {
    next(error);
  }
};

const getReponse = async (req, res, next) => {
  try {
    const { message, model, email, id } = req.body;
    const response = await davinci(message, model);

    console.log(response);

    let newJson1 = {
      role: "user",
      content: message,
    };
    let newJson2 = {
      role: "gpt",
      content: response,
    };
    if (id !== null) {
      filePath = `./../folders/${email}/history/${id}.json`;
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("An error occurred while reading the file:", err);
        } else {
          try {
            const jsonData = JSON.parse(data);
            jsonData.push(newJson1);
            jsonData.push(newJson2);
            const updatedData = JSON.stringify(jsonData, null, 2);
            fs.writeFile(filePath, updatedData, (writeErr) => {
              if (writeErr) {
                console.error(
                  "An error occurred while writing the file:",
                  writeErr
                );
              } else {
                console.log("Value added to the JSON array in the file.");
              }
            });
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
          }
        }
      });
    }

    return res.status(200).json({ success: true, response: response });
  } catch (error) {
    next(error);
  }
};

const makeUserFolder = async (req, res, next) => {
  try {
    const { email } = req.body;

    const parentDirectory = "./folders";
    const subFolderName = email;
    const historyFolderName = "history";
    const promptFolderName = "prompt";
    const structureFolderName = "structure";
    const historyStructureFileName = "history.json";
    const promptStructureFileName = "prompt.json";
    const historyDirectoryPath = `${parentDirectory}/${email}/${historyFolderName}`;
    const promptDirectoryPath = `${parentDirectory}/${email}/${promptFolderName}`;
    const structureDirectoryPath = `${parentDirectory}/${email}/${structureFolderName}`;
    const historyStructureDirectoryPath = `${parentDirectory}/${email}/${structureFolderName}/${historyStructureFileName}`;
    const promptStructureDirectoryPath = `${parentDirectory}/${email}/${structureFolderName}/${promptStructureFileName}`;

    await fs.mkdir(historyDirectoryPath, { recursive: true }, (err) => {
      if (err) {
        console.error(error);
      } else {
      }
    });

    await fs.mkdir(promptDirectoryPath, { recursive: true }, async (err) => {
      if (err) {
        console.error(error);
      } else {
      }
      await fs.mkdir(
        structureDirectoryPath,
        { recursive: true },
        async (err) => {
          if (err) {
            console.error(error);
          } else {
            const historyJsonData = [
              {
                id: 1,
                parent: 0,
                droppable: true,
                text: "History",
                type: "Folder",
              },
            ];
            const promptJsonData = [
              {
                id: 1,
                parent: 0,
                droppable: true,
                text: "Prompt",
                type: "Folder",
              },
            ];

            await fs.writeFile(
              historyStructureDirectoryPath,
              JSON.stringify(historyJsonData, null, 2),
              (err) => {
                if (err) {
                  console.error("Error creating the file:", err);
                } else {
                  console.log("File created successfully.");
                }
              }
            );

            await fs.writeFile(
              promptStructureDirectoryPath,
              JSON.stringify(promptJsonData, null, 2),
              (err) => {
                if (err) {
                  console.error("Error creating the file:", err);
                } else {
                  console.log("File created successfully.");
                }
              }
            );
          }
        }
      );
    });

    res.status(200).send({ success: true });
  } catch (error) {
    next(error);
  }
};

const getHistoryTreeData = (req, res, next) => {
  try {
    const { email } = req.body;
    const filePath = `./../folders/${email}/structure/history.json`;
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
      } else {
        try {
          const jsonData = JSON.parse(data);
          res.status(200).send({ tree: jsonData });
        } catch (parseError) {}
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateHistoryTreeData = (req, res, next) => {
  const { treeData, email, id, del } = req.body;

  try {
    const filePath = `./../folders/${email}/structure/history.json`;
    fs.writeFile(filePath, JSON.stringify(treeData, null, 2), (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
      } else {
        if (del === true) {
          const filePath = `./../folders/${email}/history/${id}.json`;

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          try {
            const jsonData = JSON.parse(data);
            res.status(200).send({ tree: jsonData });
          } catch (parseError) {}
        }
      });
    });
  } catch (err) {
    next(err);
  }
};

const getPromptTreeData = (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(email);

    const filePath = `./../folders/${email}/structure/prompt.json`;
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
      } else {
        try {
          const jsonData = JSON.parse(data);
          res.status(200).send({ result: jsonData });
        } catch (parseError) {}
      }
    });
  } catch (err) {
    next(err);
  }
};

const addNewChat = (req, res, next) => {
  const { email } = req.body;

  try {
    fs.readFile(
      `./../folders/${email}/structure/history.json`,
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          return;
        }

        try {
          const jsonObject = JSON.parse(data);

          const uniqueId = uuidv4();

          const newData = {
            id: uniqueId,
            parent: 1,
            droppable: false,
            text: "New chat",
            type: "File",
          };

          jsonObject.push(newData);

          console.log(uniqueId);

          fs.writeFile(
            `./../folders/${email}/history/${uniqueId}.json`,
            "[]",
            () => {}
          );

          fs.writeFile(
            `./../folders/${email}/structure/history.json`,
            JSON.stringify(jsonObject, null, 2),
            (err) => {
              if (err) {
                console.error("Error writing the file:", err);
                return;
              }
              res.status(200).send({ result: jsonObject, id: uniqueId });
            }
          );
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    );
  } catch (err) {
    next(err);
  }
};

const addNewFolder = (req, res, next) => {
  const { email } = req.body;

  try {
    fs.readFile(
      `./../folders/${email}/structure/history.json`,
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          return;
        }

        try {
          const jsonObject = JSON.parse(data);
          const uniqueId = uuidv4();

          const newData = {
            id: uniqueId,
            parent: 1,
            droppable: true,
            text: "New Folder",
            type: "Folder",
          };

          jsonObject.push(newData);

          fs.writeFile(
            `./../folders/${email}/structure/history.json`,
            JSON.stringify(jsonObject, null, 2),
            (err) => {
              if (err) {
                console.error("Error writing the file:", err);
                return;
              }
              res.status(200).send({ result: jsonObject });
              console.log("Data added and file saved successfully.");
            }
          );
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    );
  } catch (err) {
    next(err);
  }
};

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

const getHistoryById = async (req, res, next) => {
  try {
    const { id, email } = req.body;

    fs.readFile(
      `./../folders/${email}/history/${id}.json`,
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          return;
        }

        const jsonObject = JSON.parse(data);

        if (isEmpty(jsonObject)) {
          res.status(200).send({ result: [] });
        } else {
          res.status(200).send({ result: jsonObject });
        }
      }
    );
  } catch (error) {
    next(err);
  }
};

const addNewPromptFolder = (req, res, next) => {
  const { email } = req.body;

  try {
    fs.readFile(
      `./../folders/${email}/structure/prompt.json`,
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          return;
        }

        try {
          const jsonObject = JSON.parse(data);
          const uniqueId = uuidv4();

          const newData = {
            id: uniqueId,
            parent: 1,
            droppable: true,
            text: "New Folder",
            type: "Folder",
          };

          jsonObject.push(newData);

          fs.writeFile(
            `./../folders/${email}/structure/prompt.json`,
            JSON.stringify(jsonObject, null, 2),
            (err) => {
              if (err) {
                console.error("Error writing the file:", err);
                return;
              }
              res.status(200).send({ result: jsonObject });
              console.log("Data added and file saved successfully.");
            }
          );
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    );
  } catch (err) {
    next(err);
  }
};

const addNewPrompt = async (req, res, next) => {
  try {
    const { email, name, description, content } = req.body;

    fs.readFile(
      `./../folders/${email}/structure/prompt.json`,
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          return;
        }

        try {
          const jsonObject = JSON.parse(data);

          const uniqueId = uuidv4();

          const newData = {
            id: uniqueId,
            parent: 1,
            droppable: false,
            text: name,
            type: "File",
          };

          prompt = { name: name, description: description, content: content };

          jsonObject.push(newData);

          fs.writeFile(
            `./../folders/${email}/prompt/${uniqueId}.json`,
            JSON.stringify(prompt),
            () => {}
          );

          fs.writeFile(
            `./../folders/${email}/structure/prompt.json`,
            JSON.stringify(jsonObject, null, 2),
            (err) => {
              if (err) {
                console.error("Error writing the file:", err);
                return;
              }
              res.status(200).send({ result: jsonObject });
            }
          );
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

const addUltimateNewPrompt = async (req, res, next) => {
  try {
    const { name, description, content } = req.body;

    fs.readFile(`./../folders/system/prompt.json`, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the file:", err);
        return;
      }

      try {
        const jsonObject = JSON.parse(data);

        const uniqueId = uuidv4();

        const newData = {
          id: uniqueId,
          parent: 2,
          droppable: false,
          text: name,
          type: "File",
        };

        prompt = { name: name, description: description, content: content };

        jsonObject.push(newData);

        fs.writeFile(
          `./../folders/system/prompts/${uniqueId}.json`,
          JSON.stringify(prompt),
          () => {}
        );

        fs.writeFile(
          `./../folders/system/prompt.json`,
          JSON.stringify(jsonObject, null, 2),
          (err) => {
            if (err) {
              console.error("Error writing the file:", err);
              return;
            }
            res.status(200).send({ result: jsonObject });
          }
        );
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });
  } catch (error) {
    next(error);
  }
};

const updatePromptTreeData = (req, res, next) => {
  const { treeData, email, id, del } = req.body;
  console.log(id);
  try {
    const filePath = `./../folders/${email}/structure/prompt.json`;
    fs.writeFile(filePath, JSON.stringify(treeData, null, 2), (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
      } else {
        if (del === true) {
          const filePath = `./../folders/${email}/prompt/${id}.json`;

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        res.status(200).send({ success: true });
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateUltimatePromptTreeData = (req, res, next) => {
  const { treeData, email, id, del } = req.body;
  console.log(id);
  try {
    const filePath = `./../folders/system/prompt.json`;
    fs.writeFile(filePath, JSON.stringify(treeData, null, 2), (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
      } else {
        if (del === true) {
          const filePath = `./../folders/system/prompts/${id}.json`;

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        res.status(200).send({ success: true });
      }
    });
  } catch (err) {
    next(err);
  }
};

const getPromptById = async (req, res, next) => {
  try {
    const { id, email } = req.body;

    fs.readFile(
      `./../folders/${email}/prompt/${id}.json`,
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          return;
        }

        const jsonObject = JSON.parse(data);
        if (isEmpty(jsonObject)) {
          res.status(200).send({ result: [] });
        } else {
          res.status(200).send({ result: jsonObject });
        }
      }
    );
  } catch (error) {}
};

const getUltimatePromptById = async (req, res, next) => {
  try {
    const { id, email } = req.body;

    fs.readFile(
      `./../folders/system/prompts/${id}.json`,
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          return;
        }

        const jsonObject = JSON.parse(data);
        if (isEmpty(jsonObject)) {
          res.status(200).send({ result: [] });
        } else {
          res.status(200).send({ result: jsonObject });
        }
      }
    );
  } catch (error) {}
};

const savePrompt = async (req, res, next) => {
  try {
    const { id, email, name, description, content } = req.body;

    let idToUpdate = id;
    let newValue1 = { name: name, description: description, content: content };

    const filePath1 = `./../folders/${email}/prompt/${id}.json`;

    fs.writeFile(filePath1, JSON.stringify(newValue1), () => {});

    const filePath = `./../folders/${email}/structure/prompt.json`;
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("An error occurred while reading the file:", err);
      } else {
        try {
          let temp;
          const jsonData = JSON.parse(data);
          const indexToUpdate = jsonData.findIndex(
            (item) => item.id === idToUpdate
          );
          temp = { ...jsonData[indexToUpdate], text: name };

          if (indexToUpdate !== -1) {
            jsonData[indexToUpdate] = temp;
            const updatedData = JSON.stringify(jsonData, null, 2); // The '2' argument adds indentation for pretty formatting
            fs.writeFile(filePath, updatedData, (writeErr) => {
              if (writeErr) {
                console.error(
                  "An error occurred while writing the file:",
                  writeErr
                );
              } else {
                const filePath = `./../folders/${email}/structure/prompt.json`;
                fs.readFile(filePath, "utf8", (err, data) => {
                  if (err) {
                    console.error("Error reading JSON file:", err);
                  } else {
                    try {
                      const jsonData = JSON.parse(data);
                      res.status(200).send({ result: jsonData });
                    } catch (parseError) {}
                  }
                });
              }
            });
          } else {
            console.error(
              `JSON object with id ${idToUpdate} not found in the array.`
            );
          }
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const saveUltimatePrompt = async (req, res, next) => {
  try {
    const { id, email, name, description, content } = req.body;

    let idToUpdate = id;
    let newValue1 = { name: name, description: description, content: content };

    const filePath1 = `./../folders/system/prompts/${id}.json`;

    fs.writeFile(filePath1, JSON.stringify(newValue1), () => {});

    const filePath = `./../folders/system/prompt.json`;
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("An error occurred while reading the file:", err);
      } else {
        try {
          let temp;
          const jsonData = JSON.parse(data);
          const indexToUpdate = jsonData.findIndex(
            (item) => item.id === idToUpdate
          );
          temp = { ...jsonData[indexToUpdate], text: name };

          if (indexToUpdate !== -1) {
            jsonData[indexToUpdate] = temp;
            const updatedData = JSON.stringify(jsonData, null, 2); // The '2' argument adds indentation for pretty formatting
            fs.writeFile(filePath, updatedData, (writeErr) => {
              if (writeErr) {
                console.error(
                  "An error occurred while writing the file:",
                  writeErr
                );
              } else {
                const filePath = `./../folders/system/prompt.json`;
                fs.readFile(filePath, "utf8", (err, data) => {
                  if (err) {
                    console.error("Error reading JSON file:", err);
                  } else {
                    try {
                      const jsonData = JSON.parse(data);
                      res.status(200).send({ result: jsonData });
                    } catch (parseError) {}
                  }
                });
              }
            });
          } else {
            console.error(
              `JSON object with id ${idToUpdate} not found in the array.`
            );
          }
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const convertPrompt = async (req, res, next) => {
  try {
    const { email, name, description, content } = req.body;

    fs.readFile(
      `./../folders/${email}/structure/prompt.json`,
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          return;
        }

        try {
          const jsonObject = JSON.parse(data);

          const uniqueId = uuidv4();

          const newData = {
            id: uniqueId,
            parent: 1,
            droppable: false,
            text: name,
            type: "File",
          };

          prompt = { name: name, description: description, content: content };

          jsonObject.push(newData);

          fs.writeFile(
            `./../folders/${email}/prompt/${uniqueId}.json`,
            JSON.stringify(prompt),
            () => {}
          );

          fs.writeFile(
            `./../folders/${email}/structure/prompt.json`,
            JSON.stringify(jsonObject, null, 2),
            (err) => {
              if (err) {
                console.error("Error writing the file:", err);
                return;
              }
              res.status(200).send({ result: jsonObject });
            }
          );
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

// const getTokenCount = (req, res, next) => {
//   const { text } = req.body;
//   console.log(text);
//   try {
//     const encoding = new Tiktoken(
//       cl100k_base.bpe_ranks,
//       cl100k_base.special_tokens,
//       cl100k_base.pat_str
//     );
//     const tokens = encoding.encode(text);
//     encoding.free();
//     res.status(200).send({ count: tokens.length });
//   } catch (err) {
//     next(error);
//   }
// };

const getSystemPromptsTree = (req, res, next) => {
  try {
    fs.readFile("./../folders/system/prompt.json", "utf8", (err, data) => {
      if (err) {
        console.error("An error occurred while reading the file:", err);
      } else {
        const jsonData = JSON.parse(data);

        res.status(200).send({ result: jsonData });
      }
    });
  } catch (err) {
    next(err);
  }
};

const addUltimateNewPromptFolder = (req, res, next) => {
  try {
    fs.readFile(`./../folders/system/prompt.json`, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the file:", err);
        return;
      }

      try {
        const jsonObject = JSON.parse(data);
        const uniqueId = uuidv4();

        const newData = {
          id: uniqueId,
          parent: 2,
          droppable: true,
          text: "New Folder",
          type: "Folder",
        };

        jsonObject.push(newData);

        fs.writeFile(
          `./../folders/system/prompt.json`,
          JSON.stringify(jsonObject, null, 2),
          (err) => {
            if (err) {
              console.error("Error writing the file:", err);
              return;
            }
            res.status(200).send({ result: jsonObject });
            console.log("Data added and file saved successfully.");
          }
        );
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
  convertPrompt,
  // getTokenCount,
  saveHistory,
  addUltimateNewPromptFolder,
  getSystemPromptsTree,
  addUltimateNewPrompt,
  saveUltimatePrompt,
  getUltimatePromptById,
  updateUltimatePromptTreeData,
};
