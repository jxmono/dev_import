/*
 *  Insert apps array into database
 */
exports.insert = function(link, appsArray, callback) {

    // An empty array. Don't need trying to insert it.
    if (!appsArray.length) {
        callback();
        return;
    }

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(err);
            return;
        }
        
        M.database.open(ds, function(err, db) {

            if (err) {
                callback(err);
                return;
            }

            db.collection(ds.collection, function(err, collection) {

                if (err) {
                    callback(err);
                    return;
                }

                collection.insert(appsArray, function(err, docs) {

                    if (err) { return callback(err); }
                    if (!docs[0] || !docs.length) { return callback("No data inserted."); }

                    callback(null, docs[0]);
                });
            });
        });
    });
};

/*
 *  Deletes all applications from database
 *  It's used for refresh operation
 */
exports.delete = function(link, callback) {

    M.datasource.resolve(link.params.ds, function(err, ds) {

        if (err) {
            link.send(err);
            return;
        }
       
        M.database.open(ds, function(err, db) {

            if (err) {
                callback(err);
                return;
            }

            db.collection(ds.collection, function(err, collection) {

                if (err) {
                    callback(err);
                    return;
                }

                collection.remove({ "type": "a" }, function(err) {

                    if (err) { return callback(err); }

                    callback();
                });
            });
        });
    });
};

