const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function bodyHasNameProperty(request, response, next) {
  const { data: { name } = {} } = request.body;
  if (name) {
    return next();
  }
  next({
    status: 400,
    message: "A 'name' property is required.",
  });
}

function bodyHasDescriptionProperty(request, response, next) {
    const { data: { description } = {} } = request.body;
    if (description) {
      return next();
    }
    next({
      status: 400,
      message: "A 'description' property is required.",
    });
  }

  function bodyHasPriceProperty(request, response, next) {
    const { data: { price } = {} } = request.body;
    
    if (price && price > 0 && typeof price === 'number') {
      return next();
    }
    next({
      status: 400,
      message: "A 'price' property is required.",
    });
  }

  function bodyHasImageUrlProperty(request, response, next) {
    const { data: { image_url } = {} } = request.body;
    if (image_url) {
      return next();
    }
    next({
      status: 400,
      message: "A 'image_url' property is required.",
    });
  }

function create(request, response) {
  const { data: { name, description, price, image_url } = {} } = request.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  response.status(201).json({ data: newDish });
}

function destroy(request, response, next) {
    next({
        status: 405,
        message: "A dish cannot be deleted.",
      });
}

function dishExists(request, response, next) {
  const { dishId } = request.params;
  const foundDish = dishes.find((dish) => dish.id == dishId);
  if (foundDish) {
    response.locals.dish = foundDish;
    return next()
  }
  next({
    status: 404,
    message: `Dish doe snot exist: ${dishId}`,
  });
}

function list(request, response) {

  response.status(200).json({ data: dishes });
}

function read(request, response, next) {
  response.status(200).json({ data: response.locals.dish });
}

function idMatch(request, response, next){
    const dish = response.locals.dish;
    const { data: { id } = {} } = request.body;
    const { dishId } = request.params;
    if (id && dishId != id){
      return next({
          status: 400,
          message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
        });
    }
    next();
}

function update(request, response, next) {
  const dish = response.locals.dish;
  const { data: { name, description, image_url, price } = {} } = request.body;

  dish.name = name;
  dish.description = description;
  dish.image_url = image_url;
  dish.price = price;
  response.json({ data: dish });
}

module.exports = {
  create: [bodyHasNameProperty, bodyHasDescriptionProperty, bodyHasPriceProperty, bodyHasImageUrlProperty, create],
  list,
  read: [dishExists, read],
  update: [dishExists, bodyHasNameProperty, bodyHasDescriptionProperty, bodyHasPriceProperty, bodyHasImageUrlProperty, idMatch, update],
  delete: [destroy],
};