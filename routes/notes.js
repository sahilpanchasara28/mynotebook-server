const express = require("express");
const router = express.Router();
const Notes = require("../models/Notes");
const getuser = require("../middleware/getuser");
const { body, validationResult } = require("express-validator");

//Route 1: get all notes using: GET "/api/auth/getAllNotes"  login required

router.get("/getAllNotes", getuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong !!");
  }
});

//Route 2: add note using: POST "/api/auth/addNotes"  login required

router.post(
  "/addNote",
  getuser,
  body("title", "title must be 3 characters long !!").isLength({ min: 3 }),
  body("description", "description must be 5 characters long !!").isLength({
    min: 5,
  }),
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savedNote = await note.save();
      res.send(savedNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Something went wrong !!");
    }
  }
);

//Route 3: update exisiting note using: PUT "/api/auth/updateNote"  login required

router.put(
  "/updateNote/:id",
  getuser,
  body("title", "title must be 3 characters long !!").isLength({ min: 3 }),
  body("description", "description must be 5 characters long !!").isLength({
    min: 5,
  }),
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newNote = {};
      if (title) {
        newNote.title = title;
      }
      if (description) {
        newNote.description = description;
      }
      if (tag) {
        newNote.tag = tag;
      }
      //newNote.date = Date.now;

      //find the note to be updated and update it.

      let note = await Notes.findById(req.params.id);

      if (!note) {
        return res.status(404).send("Note not found.");
      }

      if (note.user.toString() != req.user.id) {
        return res.status(401).send("Not Allowed.");
      }

      note = await Notes.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.json({ note });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Something went wrong !!");
    }
  }
);

//Route 4: delete exisiting note using: PUT "/api/auth/deleteNote/:id"  login required

router.delete("/deleteNote/:id", getuser, async (req, res) => {
  try {
    let note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).send("Note not found.");
    }

    if (note.user.toString() != req.user.id) {
      return res.status(401).send("Not Allowed.");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ success: "Note has been deleted", note: note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong !!");
  }
});

module.exports = router;
