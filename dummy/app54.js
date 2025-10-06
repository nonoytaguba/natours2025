const fs = require('fs');
//express is a function, which upon calling will add a bunch of methods which upon calling, will add a bunch of methods in our app variable
const express = require('express'); 

const app = express();

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`,  'utf-8'
));

app.use(express.json()); 


app.get('/api/v1/tours', (req, res) =>{
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
             tours: tours
        }
    })
})

app.get('/api/v1/tours/:id', (req, res) =>{
// console.log(req.params);
const id = req.params.id * 1;
const tour = tours.find(el=>el.id === id)
if
// ( id > tours.length)
    (!tour)
    {
    return res.status(404).json({
        status: 'fail',
        message: ' Invalid ID'
    })
}




    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
             tour
        }
    })
})

app.post('/api/v1/tours', (req, res) => {
    // console.log(req.body)
    const newId = tours[tours.length -1].id + 1;
    const newTour = Object.assign({id: newId}, req.body)
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {

        res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
    } )
    }) 


const port = 3000
app.listen(port, () => {
    console.log( `App running on port ${port}.` )
})

