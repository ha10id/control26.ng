// Comment.js
// grab the mongoose module
var mongoose = require('mongoose');
var Category = require('./Document');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

    Comment = new Schema({
        'comment': String,
        'fans': Number,
        'name': String,
        'datestamp': Date,
        _creator: { type: Schema.ObjectId, ref: 'User' },
        _document: { type: Schema.ObjectId, ref: 'Document' }
    });

    Comment.virtual('id')
        .get(function() {
            return this._id.toHexString();
        });

    Comment.pre('save', function(next) {
        // this.keywords = extractKeywords(this.data);
        this.datestamp = new Date();
        console.log('Сохраняем комментарий в базу', this.comment);
        next();
    });

module.exports = mongoose.model('Comment', Comment);