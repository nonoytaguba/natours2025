//express is a function, which upon calling will add a bunch of methods which upon calling, will add a bunch of methods in our app variable
const express = require('express'); 

const app = express();


app.get('/', (req, res) => {
    res.status(404).json({
        message: 'Hello from the server side!',
        app: 'Natours'});
})

app.post ('/', (req, res)=> {
    console.log(req.body)
    res.send('You can post to this endpoint.....')
})

const port = 3000
app.listen(port, () => {
    console.log( `App running on port ${port}.` )
})

