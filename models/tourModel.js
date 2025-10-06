const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel'); //this only use in lesson 151, and not require for this lesson

//CREATING SCHEMA

const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal than 40 characters'],
        minlength: [10, 'A tour name must have more or equal than 10 characters']
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "Difficulty is either: easy, medium, difficult"
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10  // 4.66666, 46.66666, 47, 4.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    }, 
    priceDiscount:{
        type: Number,
        validate: {
        validator: function(val){
            //this only points to current doc on NEW document creation
            return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt: {
        type:Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoJSON
        type:{
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: 
            {
                type: [Number],
                default:[0,0]
            }
        ,
        address: String,
        description: String
    },
    locations: [
        {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
       }
    ],
    // For embedding example
    // guides: Array 

//For referencing
    guides:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
    // this is child referencing
    // ,
    // reviews: [{
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review'
    // }],
},
    
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}
);


// tourSchema.index({price: 1});
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere' }) //Lesson 171, 17:01
//************************************************************ */
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7
});

//************************************************************ */
// Virtual populate //lesson 157 timestamp 5:55
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});
//************************************************************** */
// Note: the term HOOk is what we call the save here, some call it middleware and some call it hooks
//DOCUMENT MIDDLEWARE: runs before .save() and .screate()
tourSchema.pre('save', function(next){
    // console.log(this)
    this.slug = slugify(this.name, {lower: true});
    next();
});
//************************************************************** */
//Embedding users, this only works for creating new documents
// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
// next();
// });

//**************************************** */

// tourSchema.pre('save', function(next){
//     console.log('will save document...');
//     next();
// })

// tourSchema.post('save', function(doc,next){
// next()
// })

//QUERY MIDDLEWARE
// tourSchema.pre('find', function(next){
tourSchema.pre(/^find/, function(next){
    this.find({secretTour:{$ne:true}});
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select:'-__v -passwordChangedAt'
       });
    next();
})

tourSchema.post(/^find/, function(docs, next){
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    // console.log(docs);
    next();
})

// tourSchema.pre('findOne', function(next){
//     this.find({secretTour:{$ne:true}});
//     next();
// })




//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate',function(next){
//     // this.pipeline();
//     this.pipeline().unshift({$match:{secreteTour:{$ne: true}}})
//     console.log(this.pipeline());
//     next();
// });

//CREATING A MODEL
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

    
    

