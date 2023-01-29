const router = require('express').Router()
const postsController = require('../controllers/postsController')
const requireUser = require('../middleware/requireUser')

router.post('/', requireUser , postsController.createPostController)
router.post('/like', requireUser , postsController.likeAndUnlikeController)
//post for create new
router.put('/', requireUser , postsController.updatePostController) //update post under put
//put for update
router.delete('/', requireUser , postsController.deletePostController)
//delete for delete post

module.exports = router