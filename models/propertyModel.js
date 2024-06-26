const mongoose = require('mongoose');
const getState = require('../utils/getState');
const getCityNameByZipcode = require('../utils/getCityByZipcode');
const { default: axios } = require('axios');
const { default: slugify } = require('slugify');

const propertySchema = new mongoose.Schema({
    price: {
        type: Number
    },
    newPrice: {
        type: Number,
        default: function () {
            return this.price;
        },
    },
    reducedPrice: {
        type: Number,
        default: 0
    },
    rentalIncome: Number,
    actualCAP: {
        type: Number
    },
    proFormaCAP: {
        type: Number
    },
    occupancy: {
        type: Number
    },
    units: {
        type: Number
    },
    zipcode: {
        type: String
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    description: {
        type: String
    },
    images: [
        {
            fieldname: String,
            originalname: String,
            encoding: String,
            mimetype: String,
            destination: String,
            filename: String,
            path: String,
            size: Number
        }
    ],
    defaultImage: Number,
    files: [
        {
            fieldname: String,
            originalname: String,
            encoding: String,
            mimetype: String,
            destination: String,
            filename: String,
            path: String,
            size: Number,
            label: String, // This is the label for the file
        }
    ],
    category: {
        type: String
    },
    published: {
        type: Boolean,
        default: false
    },
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    features: {
        type: [String]
    },
    showHome: {
        type: Boolean,
        default: false
    },
    address: String,
    numberOfBeds: Number,
    numberOfBaths: Number,
    builtYear: String,
    sqFt: Number,
    lotSqft: Number,
    propertyType: String,
    propertyCondition: String,
    hasHoa: String,
    finance_cash: { type: Boolean },
    finance_sellerFinance: { type: Boolean },
    one_percent: { type: Boolean },
    finance_mortgage: { type: Boolean, default: true },
    slug: {
        type: String,
        unique: true,
    },
    sold: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

propertySchema.pre('save', async function (next) {

    try {

        console.log('address: ', this.address);
        this.slug = slugify(this.address, { lower: true });

        const slugExists = await Property.findOne({ slug: this.slug });

        // If the slug already exists, make it unique
        if (slugExists) {
            // You can append a counter, timestamp, or any other unique identifier to make it unique
            this.slug = `${this.slug}-${Date.now()}`;
        }
    } catch (error) {
        // Handle errors appropriately
        console.log('Error: ', error);
        next(error);
    }

    // Check if the zipcode field has been modified
    if (!this.isModified('zipcode')) {
        return next();
    }

    try {
        const zipcode = this.zipcode;
        console.log('zipcode: ', zipcode);
        const response = await axios.get(`https://api.zippopotam.us/us/${zipcode}`);

        // Extract city name from the API response
        const cityName = response.data.places[0]['place name'];
        this.city = cityName;

        let state = getState(this.zipcode)?.long
        this.state = state || ''
    } catch (error) {
        console.log('zipcode is not provided');
    }

    // Continue with the save operation
    next();
});
let Property = mongoose.model('Property', propertySchema);
module.exports = Property;

// 0317-3311154