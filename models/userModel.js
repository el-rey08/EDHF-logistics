const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'full-name is required'],
        trim: true
    },

    email: {
        type: String,
        required: [true, 'email is required'],
        lowerCase: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: [true, 'password is required'],
        trim: true,
        minlenght: [8, 'password must be at least 8 character long']

    },

    address:{
        type: String,
        required:[ true, 'address is required'],
        trim: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    phoneNumber: {
        type: String,
        required: [true, 'phone number is required'],
    }
}, { timestamps: true });

const user = mongoose.model('user', userSchema)

module.exports = user