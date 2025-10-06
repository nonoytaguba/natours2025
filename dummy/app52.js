const fs = require('fs');
//express is a function, which upon calling will add a bunch of methods which upon calling, will add a bunch of methods in our app variable
const express = require('express'); 

const app = express();
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'));


app.get('/api/v1/tours', (req, res) =>{
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
             tours: tours
        }
    })
})

const port = 3000
app.listen(port, () => {
    console.log( `App running on port ${port}.` )
})

