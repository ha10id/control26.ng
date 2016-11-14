// Statistic.js
// grab the mongoose module
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define our document model
var Statistic = new Schema({
	'category': ObjectId,
	'name': String,
	'open': String,
	'work': String,
	'close': String,
	'all': String
});

Statistic.virtual('id')
.get(function() {
	return this._id.toHexString();
});

Statistic.pre('save', function(next) {
    // this.keywords = extractKeywords(this.data);
    console.log('statistic presave', this._id);
    next();
});

module.exports = mongoose.model('Statistic', Statistic);