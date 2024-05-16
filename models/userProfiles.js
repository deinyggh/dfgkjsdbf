import mongoose from "mongoose";

const userProfiles = new mongoose.Schema({
    //user settings
    userID: { type: String, require: true, unique: true},
    userName: { type: String, require: true, unique: false},
    dailyUseCount: {
        generate: {type: Number, default: 0, require: true},
        givelink: {type: Number, default: 0, require: true}
    },
    userHostDetails: {
        gdrive_shared: { type: String, require: false, unique: false },
        gdrive_personal: { type: String, require: false, unique: false },
        gdrive_personal_sa: { type: String, require: false, unique: false },
        mega: {
            user: { type: String, require: false, unique: false },
            pass: { type: String, require: false, unique: false }
        },
        defaultHost: { type: String, require: false, unique: false}
    },
    userPremiumExpire: { type: Date, require: true, default: new Date()},

    additional_details: {
        botDailyLimit: {
            generate: {type: Number, require: false, unique: false},
            givelink: {type: Number, require: false, unique: false}
        },
        botChannelID: { type: String, require: false, unique: false},
        logChannelID: { type: String, require: false, unique: false},
        bbChannelID: { type: String, require: false, unique: false},
        botBoosterPremium: { type: Boolean, require: false, unique: false},
    },
    
    paymentArray: [{
        redeemDate: { type: Date, require: false, unique: false },
        paymentCode: { type: String, require: false, unique: false },
        upgradeType: { type: String, require: false, unique: false },
        upgradeDetails: { type: String, require: false, unique: false }
    }],

    //connection
    connectionArray: [
        {
            siteName: { type: String, require: false, unique: false },
            domain: { type: String, require: false, unique: false },
            cookie: { type: String, require: false, unique: false },
            testSite: { type: String, require: false, unique: false },
            lastCheck: { type: Date, require: false, unique: false },
            description: { type: String, require: false, unique: false },
            timeBetweenChecks: { type: Number, require: false, unique: false }
        }
    ],
    connectionDetailArray: [
        {
            siteName: { type: String, require: false, unique: false },
            user: { type: String, require: false, unique: false },
            pass: { type: String, require: false, unique: false }
        }
    ]
});

export default mongoose.model("userProfiles", userProfiles);
