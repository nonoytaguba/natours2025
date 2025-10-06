const fs = require('fs');
//express is a function, which upon calling will add a bunch of methods which upon calling, will add a bunch of methods in our app variable
const express = require('express'); 
const morgan = require('morgan');

const app = express();

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`,  'utf-8'
));

// 1) MIDDLEWARES

app.use(morgan('dev'))
app.use(express.json()); 

app.use((req, res, next) => {
    console.log('Hello from teh midlleware👏')
    next();
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

//2) ROUTE HANDLERS

const getAllTours = (req, res) =>{
    console.log(req.requestTime)
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
             tours: tours
        }
    })
}

const getTour = (req, res) =>{
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
    }

const createTour = (req, res) => {
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
    })
    }

const updateTour = (req, res) => {
   
    if
    ( req.params.id * 1 > tours.length)
        {
        return res.status(404).json({
            status: 'fail',
            message: ' Invalid ID'
        })
    }
        res.status(200).json({
            status: 'success',
            data: {
                 tour : '<Upated tour here>'
            }
        })
    
    }

const deleteTour = (req, res) => {
   
    if
    ( req.params.id * 1 > tours.length)
        {
        return res.status(404).json({
            status: 'fail',
            message: ' Invalid ID'
        })
    }
        res.status(204).json({
            status: 'success',
            data: null
        })
    
    }



const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined.'
    })
    }

const getUser = (req, res) => {
        res.status(500).json({
            status: 'error',
            message: 'This route is not yet defined.'
        })
        }

const createUser = (req, res) => {
res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined.'
})
}

const updateUser = (req, res) => {
            res.status(500).json({
                status: 'error',
                message: 'This route is not yet defined.'
            })
            }
    
            const deleteUser = (req, res) => {
                res.status(500).json({
                    status: 'error',
                    message: 'This route is not yet defined.'
                })
                }


// 3) ROUTES
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/')
.get(getAllTours)
.post(createTour)

tourRouter.route('/:id')
.get(getTour)
.patch(updateTour)
.delete(deleteTour)

userRouter.route('/')
.get(getAllUsers)
.post(createUser)

userRouter.route('/:id')
.get(getUser)
.patch(updateUser)
.delete(deleteUser)

app.use('/api/v1/tours', tourRouter);  //parent route
app.use('/api/v1/users', userRouter);  //parent route



//4) START SERVER

const port = 3000
app.listen(port, () => {
    console.log( `App running on port ${port}.` )
})

