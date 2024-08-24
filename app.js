const express = require("express");
const mysql = require('mysql2');
const haversine = require("haversine");
const cors = require("cors");

const app = express();
const port = 4200;

//MiddleWare
app.use(cors());
app.use(express.json());

//MySql Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user :'root',
    database:'school_management',  
    password: '$umit@141012',
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL successfully!');
});


//School APIs

app.get("/school", (req,res)=>{
    res.json("Welcome to the school Management System");
})

//Add School API
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validate input data
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    connection.query(query, [name, address, latitude, longitude], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error adding school' });
        }
        res.json({ message: 'School added successfully' });
    });
});

//Get School APIs
app.get('/listSchools', (req, res) => {
    const userLatitude = parseFloat(req.query.latitude);
    const userLongitude = parseFloat(req.query.longitude);

    if (!userLatitude || !userLongitude) {
        return res.status(400).json({ error: 'Missing user coordinates' });
    }
    const query = `SELECT id, name, address, latitude, longitude, (6371 * acos(cos(radians(${userLatitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${userLongitude})) + sin(radians(${userLatitude})) * sin(radians(latitude)))) AS distance FROM schools
        ORDER BY distance ASC`;

    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching schools' });
        }
        res.json(results);
    });
});

app.listen(port, ()=>{
    console.log("Server is listing on port", port);
})