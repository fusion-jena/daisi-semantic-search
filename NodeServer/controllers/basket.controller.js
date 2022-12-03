const db = require("../models");
const Basket = db.baskets;
const Op = db.Sequelize.Op;

// Create
exports.create = async (req, res) => {
  const basket = {
    userId: req.body.userId, 
    content: req.body.content,
    filters: req.body.filters,
    query: req.body.query,
    keywords: req.body.kewords 
  };
 
  const result = await Basket.create(basket);
  await result.reload();

  res.status(201).send(result);
};

// Read
exports.find = (req, res) => {
    const title = req.query.title;
    var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;
  
    Basket.findAll({ where: condition })
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving the basket(s)."
        });
      });
  };

exports.findByBasketId = (req, res) => {
    const basketId = req.params.basketId;
  
    Basket.findByPk(basketId)
      .then(data => {
        if (data) {
          res.json(data);
        } else {
          res.status(404).send({
            message: `Cannot find Basket with id=${basketId}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: `Error retrieving Basket with id=${basketId}.`
        });
      });
  };

exports.findByUserId = (req, res) => {
    const userId = req.params.userId;
  
    Basket.findAll({
      where: {
        userId: userId
      }
    })
      .then(data => {
        if (data) {
          res.json(data);
        } else {
          res.status(404).send({
            message: `Cannot find Basket with id=${basketId}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: `Error retrieving Basket with id=${basketId}.`
        });
      });
  };

// Update a Tutorial by the id in the request
exports.update = async (req, res) => {
  const basket = await Basket.findByPk(req.params.basketId);

  if(basket)
  {
    basket.set({ content: req.body.content});
    await basket.save();
    await basket.reload();
    res.json(basket);
  }else{
    res.status(404).send({
      message: `Cannot find Basket with id=${req.params.basketId}.`
    });
  }
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  const basketId = req.params.basketId;

  Basket.findByPk(basketId)
    .then(data => {
      if (data) {
        data.destroy();
        res.status(200).send({
          message: `Basket with id=${basketId} was deleted successfully.`
        });
      } else {
        res.status(404).send({
          message: `Cannot find Basket with id=${basketId}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: `Error retrieving Basket with id=${basketId}.`
      });
    });
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  
};