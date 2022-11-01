const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;
const fse = require("fs-extra");
const multer = require("multer");
const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "files", "imgs")));
console.log(path.join(__dirname, "files", "imgs"));
app.listen(PORT, () => console.log(`API is running on ${PORT}`));

//CREATE ACCOUNT
app.post("/register", (req, res) => {
  const { user, password, name } = req.body;
  const path = `./files/users/${user}.json`;
  try {
    if (fs.existsSync(path)) {
      res.send({
        error: "Username already exists.",
      });
    } else {
      const createAccount = async (user, password, name) => {
        try {
          const newData = {
            token: "test123",
            user: user,
            password: password,
            name: name,
            recipes: [],
            profileImg: "",
          };
          const jsonData = JSON.stringify(newData);
          await fsp.writeFile(`./files/users/${user}.json`, jsonData);
          res.send({
            response: "User created.",
          });
        } catch (e) {
          console.log("username already exists", e);
          res.send({
            error: "Username already exists.",
          });
        }
      };
      createAccount(user, password, name);
    }
  } catch (err) {
    console.error(err);
  }
});

//CHECKING FOR USER AND PASSWORD
app.post("/login", (req, res) => {
  const { user, password } = req.body;
  const searchPassword = async (user, password) => {
    try {
      let data = await fsp.readFile(`./files/users/${user}.json`);
      let obj = JSON.parse(data);
      if (obj.password === password) {
        res.send({
          res: obj,
        });
      } else {
        console.log("wrong pass");
        res.send({
          error: "wrong password",
        });
      }
    } catch (e) {
      console.log("wrong username", e);
      res.send({
        error: "wrong username",
      });
    }
  };
  searchPassword(user, password);
});

//ADD RECIPE TO FILE
app.post("/add", (req, res) => {
  const { user, newData } = req.body;
  const writeInFile = async (user, newData) => {
    try {
      let data = await fsp.readFile(`./files/users/${user}.json`);
      let obj = await JSON.parse(data);
      let recipes = await obj.recipes;
      await recipes.push(newData);
      const addNewData = await { ...obj, recipes };
      const newDataJson = JSON.stringify(addNewData);
      fs.writeFile(`./files/users/${user}.json`, newDataJson, (err) => {
        if (err) {
          console.log("writeFile error", err);
        } else {
          console.log("saved");
        }
      });
      res.send({
        res: addNewData,
      });
    } catch (e) {
      console.log(e);
    }
  };
  writeInFile(user, newData);
});

//DELETE RECIPE TO FILE
app.post("/delete", (req, res) => {
  const { user, newData } = req.body;
  const writeInFile = async (user, newData) => {
    try {
      let data = await fsp.readFile(`./files/users/${user}.json`);
      let obj = await JSON.parse(data);
      let recipes = await obj.recipes;
      recipes = await recipes.filter((recipe) => recipe.id !== newData.id);
      const addNewData = await { ...obj, recipes };
      const newDataJson = JSON.stringify(addNewData);
      fs.writeFile(`./files/users/${user}.json`, newDataJson, (err) => {
        if (err) {
          console.log("writeFile error", err);
        } else {
          console.log("saved");
        }
      });
      res.send({
        res: addNewData,
      });
    } catch (e) {
      console.log(e);
    }
  };
  writeInFile(user, newData);
});

//ADD DATA TO BLOG
app.post("/addblog", (req, res) => {
  console.log(req.body);
  const data = req.body;
  const writeInBlog = async (data) => {
    try {
      let oldBlog = await fsp.readFile("./files/blog.json");
      let blog = await JSON.parse(oldBlog);
      await blog.push(data);
      const newBlogJson = JSON.stringify(blog);
      fs.writeFile("./files/blog.json", newBlogJson, (err) => {
        if (err) {
          console.log("writeFile error", err);
        } else {
          console.log("saved");
        }
      });
      res.send({
        blog,
      });
    } catch (e) {
      console.log(e);
    }
  };
  writeInBlog(data);
});

//SEND BLOG DATA
app.get("/blog", (req, res) => {
  const sendBlog = async () => {
    try {
      let blogData = await fsp.readFile("./files/blog.json");
      let obj = await JSON.parse(blogData);
      res.send({
        blog: obj,
      });
    } catch (e) {
      console.log(e);
    }
  };
  sendBlog();
});

//SEND COMMENT
app.post("/sendcomment", (req, res) => {
  const data = req.body;
  const fileName = "./files/blog.json";
  const writeComment = (fileName, data) => {
    fsp
      .readFile(fileName, (err) => {
        if (err) {
          console.log(err);
        }
      })
      .then((body) => JSON.parse(body))
      .then((json) => {
        json.forEach((article) => {
          if (article.id === data.articleId) {
            article.comments.push(data.comment);
          }
        });
        return json;
      })
      .then((json) => JSON.stringify(json))
      .then((body) => {
        fs.writeFile(fileName, body, (err) => {
          if (err) console.log(err);
        });
        res.send({
          blog: body,
        });
      })
      .catch((error) => console.log(error));
  };
  writeComment(fileName, data);
});

//DELETE COMMENT
app.post("/deletecomment", (req, res) => {
  const data = req.body;
  const fileName = "./files/blog.json";
  const deleteComment = (fileName, data) => {
    fsp
      .readFile(fileName, (err) => {
        if (err) {
          console.log(err);
        }
      })
      .then((body) => JSON.parse(body))
      .then((json) => {
        json.forEach((article) => {
          if (article.id === data.articleId) {
            const indexOfComment = article.comments.findIndex(
              (comment) => comment.id === data.commentId
            );
            article.comments.splice(indexOfComment, 1);
          }
        });
        return json;
      })
      .then((json) => JSON.stringify(json))
      .then((body) => {
        fs.writeFile(fileName, body, (err) => {
          if (err) console.log(err);
        });
        res.send({
          blog: body,
        });
      })
      .catch((error) => console.log(error));
  };
  deleteComment(fileName, data);
});

//SEND RATING
app.post("/sendrating", (req, res) => {
  const data = req.body;
  const fileName = "./files/blog.json";
  const setScore = (fileName, data) => {
    fsp
      .readFile(fileName, (err) => {
        if (err) {
          console.log(err);
        }
      })
      .then((body) => JSON.parse(body))
      .then((json) => {
        json.forEach((article) => {
          if (article.id === data.articleId) {
            article.rating.push(data.rating);
          }
        });
        return json;
      })
      .then((json) => JSON.stringify(json))
      .then((body) => {
        fs.writeFile(fileName, body, (err) => {
          if (err) console.log(err);
        });
        res.send({
          blog: body,
        });
      })
      .catch((error) => console.log(error));
  };
  setScore(fileName, data);
});

//GET USERS
app.get("/getusers", (req, res) => {
  const usersDirectory = "./files/users";
  fse
    .readdir(usersDirectory)
    .then((filenames) => {
      return filenames.map((filename) => path.join(usersDirectory, filename));
    })
    .then((filepaths) => {
      return filepaths.map((filepath) =>
        fse
          .readFile(filepath)
          .then((filecontents) => JSON.parse(filecontents))
          .then((json) => {
            const { recipes, password, ...userData } = json;
            return userData;
          })
      );
    })
    .then((mailcontents) => Promise.all(mailcontents))
    .then((realcontents) => {
      res.send({
        users: realcontents,
      });
    });
});

//GET USERS IMG
app.get("/getusersimg", (req, res) => {
  const usersDirectory = "./files/users";
  fse
    .readdir(usersDirectory)
    .then((filenames) => {
      return filenames.map((filename) => path.join(usersDirectory, filename));
    })
    .then((filepaths) => {
      return filepaths.map((filepath) =>
        fse
          .readFile(filepath)
          .then((filecontents) => JSON.parse(filecontents))
          .then((json) => {
            const { recipes, password, token, name, ...userData } = json;
            return userData;
          })
      );
    })
    .then((mailcontents) => Promise.all(mailcontents))
    .then((realcontents) => {
      res.send({
        users: realcontents,
      });
    });
});

//DELETE USER
app.post("/deleteuser", (req, res) => {
  const data = req.body;
  const deleteUser = (data) => {
    fsp
      .unlink(`./files/users/${data.user}.json`)
      .then(res.send({ response: "user deleted" }));
  };
  deleteUser(data);
});

//CHANGE RANK
app.post("/changerank", (req, res) => {
  const data = req.body;
  const changeRank = async (user) => {
    try {
      let data = await fsp.readFile(`./files/users/${user.user}.json`);
      let obj = JSON.parse(data);
      const token =
        obj.token !== "admin" ? (obj.token = "admin") : (obj.token = "test123");
      const newData = { ...obj, token };
      const newDataJson = JSON.stringify(newData);
      fs.writeFile(`./files/users/${user.user}.json`, newDataJson, (err) => {
        if (err) {
          console.log("writeFile error", err);
        } else {
          console.log("saved");
        }
      });
      res.send({
        response: "user rank changed.",
      });
    } catch (e) {
      console.log(e);
    }
  };
  changeRank(data);
});

//DELETE ARTICLE-UPLOAD TO ARCHIVE
app.post("/deleteblog", (req, res) => {
  const data = req.body;
  const deleteBlog = async (newId) => {
    try {
      const id = newId.id.toString();
      const data = await fsp.readFile(`./files/blog.json`);
      const obj = JSON.parse(data);
      const index = obj.findIndex((singleArticle) => singleArticle.id === id);
      const splicedData = obj.splice(index, 1);
      const newDataJson = JSON.stringify(obj);
      fs.writeFile(`./files/blog.json`, newDataJson, (err) => {
        if (err) {
          console.log("writeFile error", err);
        } else {
          console.log("saved");
        }
      });
      const archive = await fsp.readFile(
        "./files/archives/archive-articles.json"
      );
      const archiveData = JSON.parse(archive);
      archiveData.push(...splicedData);
      const newJsonArchiveData = JSON.stringify(archiveData);
      fs.writeFile(
        "./files/archives/archive-articles.json",
        newJsonArchiveData,
        (err) => {
          if (err) {
            console.log("writeFile error", err);
          } else {
            console.log("saved");
          }
        }
      );
      res.send({
        blog: obj,
      });
    } catch (e) {
      console.log(e);
    }
  };
  deleteBlog(data);
});

//SEND DELETED BLOGS
app.get("/archiveblogs", (req, res) => {
  const sendArchiveBlogs = async () => {
    try {
      let blogData = await fsp.readFile(
        "./files/archives/archive-articles.json"
      );
      let obj = await JSON.parse(blogData);
      res.send({
        blog: obj,
      });
    } catch (e) {
      console.log(e);
    }
  };
  sendArchiveBlogs();
});

//RESTORE BLOG FROM ARCHIVE FOLDER
app.post("/restoreblog", (req, res) => {
  const data = req.body;
  const restoreBlog = async (data) => {
    try {
      const archiveBlogsJson = await fsp.readFile(
        "./files/archives/archive-articles.json"
      );
      const archiveBlogs = await JSON.parse(archiveBlogsJson);
      const indexOfArchivedBlog = archiveBlogs.findIndex(
        (blog) => blog.id === data.id
      );
      const splicedArchiveBlog = archiveBlogs.splice(indexOfArchivedBlog, 1);
      const newArchiveBlogsJson = JSON.stringify(archiveBlogs);
      fs.writeFile(
        "./files/archives/archive-articles.json",
        newArchiveBlogsJson,
        (err) => {
          if (err) {
            console.log("writeFile error", err);
          } else {
            console.log("saved");
          }
        }
      );
      const oldBlogJson = await fsp.readFile("./files/blog.json");
      const oldBlog = await JSON.parse(oldBlogJson);
      await oldBlog.push(...splicedArchiveBlog);
      const newBlogJson = JSON.stringify(oldBlog);
      fs.writeFile("./files/blog.json", newBlogJson, (err) => {
        if (err) {
          console.log("writeFile error", err);
        } else {
          console.log("saved");
        }
      });
      res.send({
        blog: oldBlog,
        archive: archiveBlogs,
      });
    } catch (e) {
      console.log(e);
    }
  };
  restoreBlog(data);
});

//CHANGE PROFILE PICTURE
//SEND COMMENT
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "files", "imgs", "profile_imgs"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 102400 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/webp"
    ) {
      cb(null, true);
    } else {
      return cb(new Error("Only .png, .jpg .jpeg and .webp format allowed."));
    }
  },
}).single("file");

app.post("/changeprofilepicture", (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.send({ res: err });
    } else if (err) {
      console.log(err);
      res.send({ res: err, message: err.message });
    } else {
      const lastProfileImgLink = req.body.profile_img;
      const lastProfileImg = lastProfileImgLink.substring(
        lastProfileImgLink.lastIndexOf("/") + 1
      );
      const lastProfileImgPath = path.join(
        __dirname,
        "files",
        "imgs",
        "profile_imgs",
        lastProfileImg
      );
      const user = req.body.user;
      const profileImg = path.join(
        __dirname,
        "profile_imgs",
        req.file.filename
      );
      const changeProfilePicture = async () => {
        fs.readFile(`./files/users/${user}.json`, (err, data) => {
          const obj = JSON.parse(data);
          const newData = { ...obj, profileImg };
          const json = JSON.stringify(newData);
          fs.writeFile(`./files/users/${user}.json`, json, (err) => {
            if (err) {
              console.log("writeFile error", err);
            } else {
              fs.unlinkSync(lastProfileImgPath);
              console.log("saved");
            }
          });

          res.send({
            res: newData,
          });
        });
      };
      changeProfilePicture();
    }
  });
});

//upload blog picture
const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "files", "imgs", "blog_imgs"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const blogUpload = multer({
  storage: blogStorage,
  limits: { fileSize: 512000 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/webp"
    ) {
      cb(null, true);
    } else {
      return cb(new Error("Only .png, .jpg .jpeg and .webp format allowed."));
    }
  },
}).single("file");

app.post("/blogpicture", (req, res) => {
  blogUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.send({ res: err });
    } else if (err) {
      console.log(err);
      res.send({ res: err, message: err.message });
    } else {
      const blogImg = path.join(__dirname, "blog_imgs", req.file.filename);
      res.send({
        res: blogImg,
      });
    }
  });
});
