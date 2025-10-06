const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();
    // 2) Build template
    // 3) Render that template using tour data from 1)

    res.status(200).render("overview",{
        title: 'All Tours',
        tours: tours
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Get the data, for the requested tour (ncluding reviews and guides)
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404))
    }

    // 2) Build template
    // 3) Render template using data from 1)

    const tours = await Tour.find();
    res.status(200).render("tour", {
        title: `${tour.name} Tour`,
        tour: tour
    })
})

exports.getLoginForm = catchAsync(async(req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
})

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
}

exports.getMyTours = catchAsync(async(req, res, next) => {
    // 1) Find all bookings
        const bookings = await Booking.find({user: req.user.id})
    // 2) Find tours with the returned IDs
        const tourIDs = bookings.map(el => el.tour.id)
        const tours = await Tour.find({ _id: {$in: tourIDs}})

        res.status(200).render('overview', {
            title: 'My TOurs',
            tours
        })
})

exports.updateUserData = catchAsync(async (req, res, next) => {
// console.log( 'UPDATING USER',req.body); //this will not really work just like this, because we need to add another middleware in order to parse data coming from a form.
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
    {
        name: req.body.name, // lesson 195, 12:07 And remember that these are the names of the fields, because we gave them the name attribute in the HTML form.
        email: req.body.email
    },
    {
        new: true,
        runValidators: true
    }
);
   res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    });
// console.log('UPDATED USER', updatedUser )
// console.log(req.user.id)
}
);





