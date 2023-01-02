const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authenticationController');
const reviewRouter = require('./../Routes/reviewRoutes');

const router = express.Router();
router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(authController.protect, tourController.getMonthlyPlan);
router
  .route('/top-5-cheap')
  .get(
    tourController.aliasTopTours,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getAllTours
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
