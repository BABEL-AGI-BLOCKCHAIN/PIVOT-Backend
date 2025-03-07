import { Router } from "express";

const router = Router();


import { getTopics, getTopicById, getTopicsByUser, createTopic, invest, updateTopic } from "../controllers/topic.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


router.route('/getTopics').get( getTopics);

router.route('/topic/:id').get(getTopicById);

router.route('/topics/user/:userId').get(getTopicsByUser);

router.route('/createTopic').post(createTopic);

router.route('/invest').post(invest);

router.route('/updateTopic').post(upload.fields([
    {
        name: 'image',
        maxCount: 1
    }
]), updateTopic);

export default router;