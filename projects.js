/*
    ===============================
    MONGO FUNCTIONS: INSERT, DELETE
    ===============================
*/

/*
 *  Insert projects array into database
 */
exports.insert = function(link, projectsArray, callback) {

    // An empty array. Don't need trying to insert it.
    if (!projectsArray.length) { return callback(null); }

    M.datasource.resolve(link.params.ds, function(err, ds) {
        if (err) { return callback(err); }
        
        M.database.open(ds, function(err, db) {
            if (err) { return callback(err); }

            db.collection(ds.collection, function(err, collection) {
                if (err) { return callback(err); }

                collection.insert(projectsArray, function(err, docs) {

                    if (err) { return callback(err); }
                    if (!docs[0] || !docs.length) { return callback("No data inserted."); }

                    callback(null, docs[0]);
                });
            });
        });
    });
};

/*
 *  Deletes all projects from database
 *  It's used for refresh operation
 *  e.g: filter = { "type": "m" } will 
 *  delete only modules
 */
exports.delete = function(link, filter, callback) {

    M.datasource.resolve(link.params.ds, function(err, ds) {
        if (err) { return callback(err); }
       
        M.database.open(ds, function(err, db) {
            if (err) { return callback(err); }

            db.collection(ds.collection, function(err, collection) {
                if (err) { return callback(err); }

                collection.remove(filter, function(err) {

                    if (err) { return callback(err); }

                    callback(null);
                });
            });
        });
    });
};

