const mongoose = require('mongoose');
const { Schema } = mongoose;
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please enter a email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

// Fire a function before doc saved to db
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next();
});

// static method to login user
userSchema.statics.login = async function (email, password) {
    // see if user excite by checking the email
    const user = await this.findOne({ email });
    if (user) {
        //compare the password with user hashed password stored in mongodb
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('Incorrect Password');
    }
    throw Error('Incorrect Email');
}


module.exports = mongoose.model('User', userSchema);