module.exports = (sequelize, Sequelize) => {
  const Basket = sequelize.define("basket", {
    basketId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: Sequelize.TEXT
    },
    content: {
      type: Sequelize.JSON,
      get: function () {
        return JSON.parse(this.getDataValue('content'));
      },
    },
    query: {
      type: Sequelize.JSON,
      get: function () {
        return JSON.parse(this.getDataValue('query'));
      },
    },
    keywords: {
      type: Sequelize.JSON,
      get: function () {
        return JSON.parse(this.getDataValue('keywords'));
      },
    },
    filters: {
      type: Sequelize.JSON,
      get: function () {
        return JSON.parse(this.getDataValue('filters'));
      },
    }
  });

  return Basket;
};