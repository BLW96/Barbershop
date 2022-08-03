const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const compression = require('compression');
const ExpressError = require('./utils/ExpressError');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

require('dotenv').config({ path: './config/.env' });


const app = express();

const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: 'storeSession'
});

//Setup Mongoodb
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


// Setup engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// express parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.locals.errors = null;

const Category = require('./models/Category');
// Get all category to pass to header
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }

})


//express session middleware

app.use(fileUpload());
app.use(flash());
app.use(compression());

app.use(session({
    secret: process.env.SESSION_SEC,
    store: store,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    resave: false,
    saveUninitialized: false,
}));


// Set global errors , success flash messages
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    // res.locals.session = req.session
    next();
});


app.get('*', async function (req, res, next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});



// Get Admin routes
const adminProducts = require('./routes/admin_products');
const adminCategories = require('./routes/admin_categories');

// Get Main routes
const authRoute = require('./routes/auth');
const productsRoute = require('./routes/products');
const cartRoute = require('./routes/cart');


app.use('*', checkUser);

// All routes
app.use('/auth', authRoute);
app.use('/admin/products', requireAuth, adminProducts);
app.use('/admin/categories', requireAuth, adminCategories);
app.use('/products', productsRoute);
app.use('/cart', requireAuth, cartRoute);

// GET Admin Page 
app.get('/admin', (req, res) => {
    res.render('admin/admin_area', {
        title: 'admin area'
    })
});

// GET Home Page
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Barber Salon'
    });
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'oh no something went wrong!';
    res.status(statusCode).render('error', { err, title: "Error Page" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log('Listening On Port ' + port);
});