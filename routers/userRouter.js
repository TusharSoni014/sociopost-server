const requireUser = require('../middleware/requireUser')
const userController = require('../controllers/userController')
const router = require('express').Router()

router.post('/follow',requireUser, userController.followOrUnfollowUserController)
router.get('/getFeedData',requireUser, userController.getPostsOfFollowings)
router.get('/getMyPosts',requireUser, userController.getMyPosts)
router.get('/getUserPosts',requireUser, userController.getUserPosts)
router.delete('/delete',requireUser, userController.deleteMyProfile)
router.get('/getMyInfo',requireUser, userController.getMyInfo)
router.post('/getUserProfile',requireUser, userController.getUserProfile)
router.put('/',requireUser, userController.updateMyProfile) //put mtlb update

module.exports = router