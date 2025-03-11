const mongoose = require('mongoose');

const forgotPasswordRequestSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => uuidv4(),
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('ForgotPasswordRequest', forgotPasswordRequestSchema);
