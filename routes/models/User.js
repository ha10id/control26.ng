// User.js
// grab the mongoose module
var mongoose  = require('mongoose');
var Document  = require('./Document');
var Comment   = require('./Comment');
var Category  = require('./Category');
var Goverment = require('./Goverment');

var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

function validatePresenceOf(value) {
    return value && value.length;
}

User = new Schema({
	email: { type: String, validate: [validatePresenceOf, 'an email is required'] },
	uid: String,
	login: String,
    name: String,
    middleName: String,
    firstName: String,
    lastName: String,
    banned: Boolean,
    birthdate: Date,
    avatar: String,
    group: Number,
    regdate: Date,
    category: { type: ObjectId, ref: 'Category' },
    goverment: { type: ObjectId, ref: 'Goverment' },
    comments: [{ type: ObjectId, ref: 'Comment' }],
    documents: [{ type: ObjectId, ref: 'Document' }]
});

User.statics.findAndModify = function(query, sort, doc, options, callback) {
	return this.collection.findAndModify(query, sort, doc, options, callback);
};

User.virtual('id')
.get(function() {
	return this._id.toHexString();
});


User.pre('save', function(next) {
	this.regdate = new Date();
	next();
});

module.exports = mongoose.model('User', User);