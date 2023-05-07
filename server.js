const http = require('http');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log("un caught exception'✨✨ shuting down....");
  console.log(err);
  process.exit(1);
});

const app = require('./app');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome',
  });
});

const dbstr = `${process.env.DATABASE}`.replace(
  `<PASSWORD>`,
  `${process.env.DATABASE_PASSWORD}`
);

mongoose
  .connect(dbstr, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('connections succifully created');
  });

// console.log(dbstr);
console.log(app.get('env'));
const port = process.env.PORT || 5000;
//CREATE SERVER
const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err, err.message);
  console.log('un handled rejection');
  server.close(() => {
    process.exit(1);
  });
});
