var Apps = require("./apps");
var Modules = require("./modules");

/*
    ================
        APPS PART
    ================
*/

/*
 *  Import apps
 *  1. Get all repositories from Github for logged owner
 *  2. Filter for Mono apps
 *  3. Create appsArray of objects:
 *  {
 *      "type": "a",
 *      "repo": "...",
 *      "owner": link.session.ownerId
 *  }
 *  4. Insert the array of objects into databse
 */

exports.importApps = function(link) {
    
    // TODO Build appsArray

    Apps.import(link, appsArray, function(err, data) {
        
        if (err) {
            link.send(400, err);
            return;
        }

        link.send(200, data);
    });
};

exports.refreshApps = function(link) {

};

/*
    ===================
        MODULES PART
    ===================
*/

exports.importModules = function(link) {
    // Not yet implemented
};


exports.refreshModules = function(link) {
    // Not yet implemented
};
