// Document.js
// grab the mongoose module
var mongoose = require('mongoose');
var Category = require('./Category');
var Comment = require('./Comment');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// define our document model
var Document = new Schema({
    title : {type : String, default: ''},
    address: String,
    category: { type: ObjectId, ref: 'Category' },
    checked: Number,
    description: String,
    images: [{ type: String }],
    latitude: Number,
    longitude: Number,
    name: String,
    pcid: Number,
    status: Number,
    datestamp: Date,
    lastedit: Date,
    _comments: [{ type: ObjectId, ref: 'Comment' }]
});

Document.virtual('id')
    .get(function() {
        return this._id.toHexString();
});

Document.virtual('geoObject')
    .get(function() {
        var go = {
            geometry: {
                type: "Point",
                coordinates: [this.longitude, this.latitude]
            },
            properties: {
                hintContent:  this.title,
                balloonContent: '<a href="/readDocument/' + this.id +'">' + this.title + '</a>' + '<p>' + this.description + '</p>'
            }
        };
        return go;
});

Document.pre('save', function(next) {
    this.lastedit = new Date();
    console.log('document presave', this._id.toHexString());
    next();
});

module.exports = mongoose.model('Document', Document);
