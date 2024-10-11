import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos } from "../controllers/video.controller.js";

const router = new Router();
router.use(verifyJWT);

router.route("/").get(getAllVideos);

export default router;
