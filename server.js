const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data.json');
const HTML_FILE = path.join(__dirname, 'public', 'index.html');

// Function to read data from the JSON file
const readData = () => {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return [];
};

// Function to write data to the JSON file
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Function to update the HTML file with new data
const updateHtmlFile = (data) => {
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Submit Your Experience</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          background-color: #f4f4f4;
        }
        form {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        label, textarea, input {
          display: block;
          width: 100%;
          margin-bottom: 10px;
        }
        textarea {
          height: 150px;
        }
        input[type="submit"] {
          background-color: #007BFF;
          color: #fff;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.3s;
        }
        input[type="submit"]:hover {
          background-color: #0056b3;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px auto;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #007BFF;
          color: #fff;
        }
      </style>
    </head>
    <body>
      <h1 style="text-align: center;">Submit Your Experience</h1>
      <form id="experienceForm">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required>
    
        <label for="experience">Your Experience:</label>
        <textarea id="experience" name="experience" required></textarea>
    
        <input type="submit" value="Submit">
      </form>
    
      <h2 style="text-align: center;">Submitted Articles</h2>
      <table id="articlesTable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Experience</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(article => `
            <tr>
              <td>${article.name}</td>
              <td>${article.experience}</td>
              <td>${new Date(article.date).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    
      <script>
        document.getElementById('experienceForm').addEventListener('submit', function(event) {
          event.preventDefault();
          var name = document.getElementById('name').value;
          var experience = document.getElementById('experience').value;
    
          fetch('/submitExperience', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name, experience: experience })
          })
          .then(response => response.json())
          .then(data => {
            alert(data.message);
            loadArticles();
          })
          .catch(error => {
            console.error('Error:', error);
          });
        });
    
        function loadArticles() {
          fetch('/experiences')
            .then(response => response.json())
            .then(data => {
              const tableBody = document.querySelector('#articlesTable tbody');
              tableBody.innerHTML = '';
              data.forEach(article => {
                const row = document.createElement('tr');
                row.innerHTML = `
                  <td>${article.name}</td>
                  <td>${article.experience}</td>
                  <td>${new Date(article.date).toLocaleString()}</td>
                `;
                tableBody.appendChild(row);
              });
            });
        }
    
        // Load articles on page load
        window.onload = loadArticles;
      </script>
    </body>
    </html>
  `;
  fs.writeFileSync(HTML_FILE, htmlContent, 'utf-8');
};

app.post('/submitExperience', (req, res) => {
  const { name, experience } = req.body;
  const data = readData();
  data.push({ name, experience, date: new Date().toISOString() });
  writeData(data);
  updateHtmlFile(data);
  res.json({ message: 'Experience submitted successfully!' });
});

app.get('/experiences', (req, res) => {
  const data = readData();
  res.json(data);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
