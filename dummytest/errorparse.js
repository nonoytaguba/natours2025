{
  errors: {
      name: {
        name: 'ValidatorError',
        message: 'A tour name must have more or equal than 10 characters',
        properties: [Object],
        kind: 'minlength',
        path: 'name',
        value: 'Short'
      },
      difficulty: {
        name: 'ValidatorError',
        message: 'Difficulty is either: easy, medium, difficult',
        properties: [Object],
        kind: 'enum',
        path: 'difficulty',
        value: 'whatever'
      },
      ratingsAverage: {
        name: 'ValidatorError',
        message: 'Rating must be below 5.0',
        properties: [Object],
        kind: 'max',
        path: 'ratingsAverage',
        value: 6
      }
    },
    _message: 'Validation failed',
    statusCode: 500,
    status: 'error',
    name: 'ValidationError',
    message: 'Validation failed: name: A tour name must have more or equal than 10 characters, difficulty: Difficulty is either: easy, medium, difficult, ratingsAverage: Rating must be below 5.0'
  }