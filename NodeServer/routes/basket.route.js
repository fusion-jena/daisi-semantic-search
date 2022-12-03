module.exports = app => {
    const baskets = require("../controllers/basket.controller.js");
    const keycloak = require('../config/keycloak.config.js').getKeycloak();

    var router = require("express").Router();
  
   /**
   * @swagger
   * /api/baskets:
   *  post:
   *    summary: Creates a new basket.
   *    tags: [Dai:Se - Baskets]
   *    consumes:
   *      - application/json
   *    parameters:
   *      - in: body
   *        name: basket
   *        description: The basket to create.
   *        schema:
   *          type: object
   *          properties:
   *            content:
   *              type: string
   *            filters:
   *              type: string
   *            query:
   *              type: string
   *            userId:
   *              type: string
   *            keywords:
   *              type: string
   *    responses:
   *      201:
   *        description: Created
   */
   router.post("/", baskets.create);
  

   /**
   *  @swagger
   *  /api/baskets:
   *     get:
   *        description: Returns all existing baskets.
   *        tags: [Dai:Se - Baskets]
   *        summary: Returns JSON containing all baskets.
   *        responses:
   *           200:
   *              description: JSON with list of basket objects as JSON.
   */
   router.get("/", baskets.find);

   /**
   * @swagger
   * /api/baskets/{basketId}:
   *   get:
   *     description: Returns a specific basket based on the basketId.
   *     tags: [Dai:Se - Baskets]
   *     summary: Returns a specific basket based on the basketId.
   *     parameters:
   *       - in: path
   *         name: basketId
   *         description: basketId of the basket to retrieve.
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: basket as json object.
   */
   router.get("/:basketId", baskets.findByBasketId);

   /**
    * @swagger
    * /api/baskets/user/{userId}:
    *   get:
    *     description: Returns a list baskets based on the userId.
    *     tags: [Dai:Se - Baskets]
    *     summary: Returns all baskets related to a specific user (identified by userId).
   *     parameters:
   *       - in: path
   *         name: userId
   *         description: userId of all baskets to retrieve.
   *         schema:
   *           type: string
    *     responses:
    *       200:
    *         description: an array of baskets wich specific userId as a JSON object  
    */
    router.get("/user/:userId", baskets.findByUserId);

   /**
   * @swagger
   * /api/baskets:
   *   put:
   *     description: Updates a specific basket based on basketId.
   *     tags: [Dai:Se - Baskets]
   *     summary: updates and returns a basket based on the basketId with values from body.
   *     consumes:
   *      - application/json
   *     parameters:
   *      - in: body
   *        name: basket
   *        description: The basket to create.
   *        schema:
   *          type: object
   *          properties:
   *            content:
   *              type: string
   *            filters:
   *              type: string
   *            query:
   *              type: string
   *            userId:
   *              type: string
   *            keywords:
   *              type: string    
   * 
   * responses:
   *       200:
   *         description: updates a basket with given basketId with values from body.
   */
   router.put("/:basketId", baskets.update);

   /**
   * @swagger
   * /api/baskets:
   *   delete:
   *     description: Deletes all existing baskets.
   *     tags: [Dai:Se - Baskets]
   *     summary: ToDo.
   *     responses:
   *       200:
   *         description: ...
   */
   router.delete("/", baskets.deleteAll);

   /**
   * @swagger
   * /api/baskets/basketId:
   *   delete:
   *     description: Deletes a specific basket.
   *     tags: [Dai:Se - Baskets]
   *     summary: ToDo.
   *     parameters:
   *       - in: path
   *         name: basketId
   *         description: basketId of the basket to delete.
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: ...
   */
   router.delete("/:basketId", baskets.delete);
  
   app.use('/api/baskets', router);
  };