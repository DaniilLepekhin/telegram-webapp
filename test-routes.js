const telegramRouter = require('./backend/src/routes/telegram.js');

console.log('Routes count:', telegramRouter.stack.length);
telegramRouter.stack.forEach((layer, i) => {
  const path = layer.route ? layer.route.path : 'no-path';
  const methods = layer.route ? Object.keys(layer.route.methods).join(',') : 'no-methods';
  console.log(`Route ${i + 1}: ${methods.toUpperCase()} ${path}`);
});
