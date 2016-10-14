// Category.js
// grab the mongoose module
var mongoose = require('mongoose');
var Goverment = require('./Goverment');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define our document model
var Category = new Schema({
	'name': String,
	'_ogv': { type: Schema.ObjectId, ref: 'Goverment' },
	'goverment': { type: Schema.ObjectId, ref: 'Goverment' }
});

Category.virtual('id')
.get(function() {
	return this._id.toHexString();
});

Category.pre('save', function(next) {
    // this.keywords = extractKeywords(this.data);
    console.log('category presave', this._ogv);
    next();
});


module.exports = mongoose.model('Category', Category);
