const { Thought, User } = require('../models');

const thoughtController = {
  // Get all thoughts
  async getAllThoughts(req, res) {
    Thought.find({})
      .populate({
        path: 'reactions',
        select: '-__v',
      })
      .select('-__v')
      .sort({ _id: -1 })
      .then((dbThoughtData) => res.json(dbThoughtData))
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },

  // Get a thought by id
  async getThoughtById({ params }, res) {
    Thought.findOne({ _id: params.id })
      .populate({
        path: 'reactions',
        select: '-__v',
      })
      .select('-__v')
      .then((dbThoughtData) => {
        if (!dbThoughtData) {
          return res.status(404).json({ message: 'No thought found with this id!' });
        }
        res.json(dbThoughtData)
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },

  // Create a thought, and push its _id to the associated
  // user's thoughts array
  async createThought({ params, body }, res) {
    Thought.create(body)
      .then(({ _id }) => {
        return User.findOneAndUpdate(
          { _id: body.userId },
          { $push: { thoughts: _id } },
          { new: true },
        );
      })
      .then((dbUserData) => {
        if (!dbUserData) {
          return res.status(404).json({ message: 'Thought was created, but no user exists w/ this id!' });
        }
        res.json({ message: 'Thought created successfully!' });
      }).catch((err) => res.json(err));
  },

  // Update a thought by id
  async updateThought({ params, body }, res) {
    Thought.findOneAndUpdate({ _id: params.id }, body, {
      runValidators: true,
      new: true,
    })
      .then((dbThoughtData) => {
        if (!dbThoughtData) {
          return res.status(404).json({ message: 'No thought found with this id!' });
        }
        res.json(dbThoughtData);
      }).catch((err) => res.json(err));
  },

  // Delete a thought
  async deleteThought(req, res) {
    Thought.findOneAndDelete({ _id: params.id })
      .then((dbThoughtData) => {
        if (!dbThoughtData) {
          return res.status(404).json({ message: "No thought with this id!" });
        }
        return User.findOneAndUpdate(
          { thoughts: params.id },
          { $pull: { thoughts: params.id } },
          { new: true }
        );
      })
      .then((dbUserData) => {
        if (!dbUserData) {
          return res
            .status(404)
            .json({ message: "Thought created but no user with this id!" });
        }
        res.json({ message: "Thought successfully deleted!" });
      })
      .catch((err) => res.json(err));
  },
};
