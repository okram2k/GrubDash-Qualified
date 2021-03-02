const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];

function bodyHasDeliverToProperty(request, response, next) {
  const { data: { deliverTo  } = {} } = request.body;
  if (deliverTo ) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo.",
  });
}
function bodyHasMobileNumberProperty(request, response, next) {
    const { data: { mobileNumber  } = {} } = request.body;
    if (mobileNumber ) {
      return next();
    }
    next({
      status: 400,
      message: "Order must include a mobileNumber.",
    });
  }
  function bodyHasDishesProperty(request, response, next) {
    const { data: { dishes } = {} } = request.body;
    if (Array.isArray(dishes) && dishes.length > 0) {
      return next();
    }
    next({
      status: 400,
      message: `Order must include a dish ${dishes}`,
    });
  }
  function bodyDishQuantityProperty(request, response, next) {
    const { data: { dishes } = {} } = request.body;
    dishes.forEach((dish) =>{
        const quantity = dish.quantity
        if (!quantity || quantity <= 0 || typeof quantity !== 'number'){
            return  next({
                status: 400,
                message: `Dish ${dish.id} must have a quantity that is an integer greater than 0`,
              });
        }
    });
    next();   
  }
  function OrderIsPending(request, response, next) {
    const  { status } = {} = response.locals.order;
    if (status !== "pending") {
      return next({
        status: 400,
        message: `An order cannot be deleted unless it is pending order status: ${status}`,
      });
    }
    next();
    
  }
  function resultStatusIsValid(request, response, next) {
    const { data: { status } = {} } = request.body;
    if (validStatus.includes(status)) {
      return next();
    }
    next({
      status: 400,
      message: `Value of the 'status' property must be one of ${validStatus}. Received: ${status}`,
    });
  }

function create(request, response, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = request.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  response.status(201).json({ data: newOrder });
}

function destroy(request, response) {
  const { orderId } = request.params;
  const index = orders.findIndex((order) => order.id == orderId);
  const deletedOrders = orders.splice(index, 1);

  response.sendStatus(204);
}

function orderExists(request, response, next) {
  const { orderId } = request.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    response.locals.order = foundOrder;
    return next()
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}

function list(request, response) {
  const { orderId } = request.params;
  const byResult = orderId ? (order) => order.result === orderId : () => true;
  response.json({ data: orders.filter(byResult) });
}

function read(request, response, next) {
  response.json({ data: response.locals.order });
}

function idMatch(request, response, next){
    const { data: { id } = {} } = request.body;
    const { orderId } = request.params;
    if (id && orderId != id){
      return next({
          status: 400,
          message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
        });
    }
    next();
}

function update(request, response, next) {
  const order = response.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = request.body;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;
  response.json({ data: order });
}

module.exports = {
  create: [bodyHasDeliverToProperty, bodyHasMobileNumberProperty, bodyHasDishesProperty, bodyDishQuantityProperty, create],
  list,
  read: [orderExists, read],
  update: [orderExists, bodyHasDeliverToProperty, bodyHasMobileNumberProperty, bodyHasDishesProperty, bodyDishQuantityProperty, resultStatusIsValid, idMatch, update],
  delete: [orderExists, OrderIsPending, idMatch, destroy],
};