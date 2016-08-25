// Goverment.js
// grab the mongoose module
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define our document model
Goverment = new Schema({
	'name': String,
	'worker': { type: Schema.ObjectId, ref: 'User' }
});

Goverment.virtual('id')
.get(function() {
	return this._id.toHexString();
});

Goverment.pre('save', function(next) {
    // this.keywords = extractKeywords(this.data);
    console.log('ogv presave', this._worker);
    next();
});


module.exports = mongoose.model('Goverment', Goverment);
