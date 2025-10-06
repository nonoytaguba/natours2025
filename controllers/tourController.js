const multer = require('multer'); //lesson 200
const sharp = require('sharp');
const Tour = require('./../models/tourModel.js');
// const APIFeatures =require('./../utils/apiFeatures.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const factory = require('./handlerFactory')

const multerStorage = multer.memoryStorage(); //lesson 202 , 3:39

//Creating Multerfilter, test if the uploaded file is an image
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        db(new(new AppError('Not an image! Please upload only images.', 400)), false)
    }
}

// const upload = multer({dest: 'public/img/users'}); //lesson 200

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
}); 

// Uploading multiple files
exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync (async (req, res, next) => {
    // console.log('req.files', req.files);

    if (!req.files.imageCover || !req.files.images) return next();

   // 1) Cover image
   req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
   await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${req.body.imageCover}`);
    
    // 2) Images
    req.body.images = []
    await Promise.all (req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${filename}`);
    
        req.body.images.push(filename);
    })
);

    console.log(req.body);
    next();
})

exports.aliasTopTours = (req, res, next) => {
   req.query.limit = '5';
   req.query.sort = '-ratingsAverage,price';
   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
   next();
}

// exports.getAllTours = catchAsync(async (req, res, next) =>{
//       const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate()
//         const tours = await features.query;


//         //SEND RESPONSE
//         // console.log(req.requestTime)
//         res.status(200).json({
//             status: 'success',
//             requestedAt: req.requestTime,
//             results: tours.length,
//             data: {
//                  tours: tours
//             }
//         })
// });

// exports.getTour = catchAsync(async (req, res, next) =>{
//     const tour = await Tour.findById(req.params.id).populate('reviews');   
    
//     // const tour = await Tour.findById(req.params.id).populate({
//     //     path: 'guides',
//     //     select: '-__v -passwordChangedAt'
//     // });

//     // const tour = await Tour.findById(req.params.id).populate('guides');
//         //Tour.findOne({_id: req.params.id})

//         if(!tour){
//              return next(new AppError('No tour found with that ID', 404))
//         }

//         res.status(200).json({
//             status: 'success',
//             data: {
//                  tour
//             }
//         });
//     });


// exports.createTour = catchAsync (async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
    
//     res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour
//         }
//     });

//     });
exports.getAllTours = factory.getAll(Tour)
exports.getTour = factory.getOne(Tour, {path: 'reviews'});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);





// exports.updateTour = catchAsync(async (req, res, next) => {
//        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//             new:true,
//             runValidators: true
//         })

//         if(!tour){
//             return next(new AppError('No tour found with that ID', 404))
//        }
//             res.status(200).json({
//             status: 'success',
//             data: {
//                 tour 
//             }
//         })
//     });








// exports.deleteTour = catchAsync(async (req, res, next) => {
//       const tour = await Tour.findByIdAndDelete(req.params.id);

//       if(!tour){
//         return next(new AppError('No tour found with that ID', 404))
//    }
//         res.status(204).json({
//             status: 'success',
//             data: null
//         })
//     });

exports.getTourStats = catchAsync(async (req, res, next) => {
      const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 }}
            },
            {
                $group: {
                    _id: {$toUpper: '$difficulty'},
                    numTours: {$sum: 1},
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRating: {$avg: '$ratingsAverage'},
                    avgPrice: {$avg: '$price' },
                    minPrice:  {$min: '$price'},
                    maxPrice:  {$max: '$price'},
                }
            },
            {
                $sort: {avgPrice: 1}
            },
            // {
            //     $match: {_id: {$ne: 'EASY'}}
            // }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
      const year = req.params.year * 1;  //2021

        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match: {
                    startDates: {
                      $gte: new Date(`${year}-01-01`),
                      $lte: new Date(`${year}-12-31`)      
                    }
                }
            },
            {
                $group: {
                   _id: {$month: '$startDates'},
                   numTourStarts: {$sum: 1},
                   tours: {$push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id'}
            },
            {
                $project: {
                   _id: 0 
                }
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
                $limit: 6
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
});

// router.route('/tours-within/:distance/center/:latlng/unit/:unit', tourController.getToursWithin)
// /tours-within?distance=233&center=-40&45&unit=mi
// /tours-within/distance/233/center/34.111745,-118.113491/unit/mi

exports.getToursWithin = catchAsync (async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if(!lat || !lng){
        next(new AppError('Please provide latitude ang longtitude in the format lat, lng.', 400))
    };

    // console.log(distance, lat, lng, unit)


    const tours = await Tour.find({startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius ]}}});
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
});

exports.getDistances = catchAsync(async(req, res, next) =>{
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
  

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng){
        next(new AppError(
            'Please provide latitude ang longtitude in the format lat, lng.', 400
        )
    );
    }
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1 ]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier // 0.001 this is exactly the same as dividing by 1000
            }
        },
        {
            $project:{
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})



















