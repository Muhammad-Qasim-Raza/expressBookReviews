const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");

let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();


// Internal books data endpoint
public_users.get('/api/books', (req, res) => {
  return res.status(200).json(books);
});


// Internal book by ISBN endpoint
public_users.get('/api/books/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200).json(book);
});


// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  users.push({
    username: username,
    password: password
  });

  return res.status(201).json({
    message: "User successfully registered"
  });
});


// Get all books using Axios + async/await
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get(
      'http://localhost:5000/api/books'
    );

    return res.status(200).json(response.data);

  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving books"
    });
  }
});


// Get book by ISBN using Axios + async/await
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;

    const response = await axios.get(
      `http://localhost:5000/api/books/${isbn}`
    );

    return res.status(200).json(response.data);

  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    return res.status(500).json({
      message: "Error retrieving book"
    });
  }
});


// Get books by author using Axios + async/await
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();

    const response = await axios.get(
      'http://localhost:5000/api/books'
    );

    const result = {};

    for (const isbn in response.data) {
      const book = response.data[isbn];

      if (book.author.toLowerCase() === author) {
        result[isbn] = book;
      }
    }

    if (Object.keys(result).length === 0) {
      return res.status(404).json({
        message: "No books found for this author"
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving books"
    });
  }
});


// Get books by title using Axios + async/await
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();

    const response = await axios.get(
      'http://localhost:5000/api/books'
    );

    const result = {};

    for (const isbn in response.data) {
      const book = response.data[isbn];

      if (book.title.toLowerCase().includes(title)) {
        result[isbn] = book;
      }
    }

    if (Object.keys(result).length === 0) {
      return res.status(404).json({
        message: "No books found for this title"
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving books"
    });
  }
});


// Get book reviews using Axios + async/await
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;

    const response = await axios.get(
      'http://localhost:5000/api/books'
    );

    const book = response.data[isbn];

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    return res.status(200).json(book.reviews);

  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving review"
    });
  }
});


module.exports.general = public_users;