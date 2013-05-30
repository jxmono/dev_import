// Require projects module from same directory.
var Projects = require("./projects");

/*
 *  Import projects
 *  ===============
 *  1. Get all repositories from Github for logged owner
 *  2. Filter for Mono projects
 *  3. Create monoProjects array of objects:
 *  {
 *      "type":             "a/m"
 *      "repo":             "github/bitbucket\/username\/repo-name"
 *      "owner":            "Mongo id"
 *      "ownership":        "owner/member",
 *      "repo_url":         "... .git",
 *      "name":             "Name of Mono project",
 *      "descriptor":       {...}
 *      "provider":         "github/bitbucket"
 *  }
 *  4. Insert the array of objects into database
 *
 *  A Mono project can be an application or a module.
 *  If it's an application its type will be "a", else 
 *  it will be "m" (module).
 */
exports.importProjects = function(link) {

    link.data = link.data || {};
 
    // TODO Validate data

    if (!link.data.type) {
        link.send(400, "Missing type. Type can be 'a' (for applications) or 'm' (for modules).");
        return;
    }

    var SECRETS = require(M.app.getPath() + "/secrets.json")[link.session.provider];

    var data = {
        auth: link.session.auth,
        type: link.data.subtype,
        user: link.session.login
    };

    // TODO How will this appear when 
    //      the accounts will be connected?
    switch (link.session.provider) {
        case "bitbucket":
            data.secrets = SECRETS;
            //if (typeof OAUTH === 'undefined') { return link.send(400, "First, login with Bitbucket."); }
            break;

        case "github":
            data.auth.token = data.auth.access_token;
            break;

        default:
            return link.session(400, "Invalid provider.");
    }

    M.repo.getUserRepos(link.session.provider, data.user, data, function (err, reposArray) {

        if (err) { return link.send(400, err); }
        
        var monoProjects = [];
        var count = 0;

        // For each repo in reposArray
        for (var i = 0; i < reposArray.length; ++i) {
                
            // Repo object
            var appObj = reposArray[i];
            
            // slug for BB which doesn't exist in GH repo objects
            var currentRepo = appObj.slug || appObj.name;

            // This variable will be passed into hasFile function.
            var searchData = {
                auth: link.session.auth,
                path: (link.data.type === "a" ? M.config.APPLICATION_DESCRIPTOR_NAME : M.config.MODULE_DESCRIPTOR_NAME),
                repo: currentRepo,
                appObj: appObj,
                secrets: SECRETS
            };

            if (link.session.provider === "github") {
                searchData.user = appObj.owner.login;
                searchData.auth.token = searchData.auth.access_token;
            }
            else {
                searchData.user = appObj.owner;
            }

            // In same time hasFile function will be called multiple times.
            // This is a great optimization method.
            M.repo.getJsonFromRepo(link.session.provider, searchData, function (err, data, descriptor) {

                // Increment count.
                ++count;
               
                // An non-404 error ocured. Kill operation.
                if (err && (err.code !== 404 && err.code !== "API_REPO_PATH_NOT_FOUND")) {
                    link.send(400, err);
                    return;
                }

                // The repo is a Mono project
                if (descriptor) {

                    appObj = data.appObj;
                    
                    // Data to insert in database for each Mono project
                    var monoProjectData = {
                        "type": link.data.type,
                        "owner": link.session._uid,
                        "ownership": link.data.subtype,
                        "repo_url": appObj.git_url || "...not yet implemented for BB.",
                        // TODO Find a shorter way. Maybe owner + slug for both providers?
                        "repo": link.session.provider + "/" + (appObj.full_name || (appObj.owner + "/" + appObj.slug)),
                        "name": descriptor.name,
                        "descriptor": JSON.stringify(descriptor),
                        "provider": link.session.provider
                    };
                    
                    // Push project data in Mono projects array.
                    monoProjects.push(monoProjectData);
                }

                // When count is reposArray.length, all repos were completed
                if (count === reposArray.length) {

                    var filters = { 
                        "type": link.data.type,
                        "ownership": link.data.subtype,
                        "provider": link.session.provider
                    };

                    var options = {};
                    
                    Projects.delete(link, filters, options, function (err) {
                        
                        if (err) {
                            link.send(400, err);
                            return;
                        }

                        Projects.insert(link, monoProjects, function(err, data) {

                            if (err) {
                                link.send(400, err);
                                return;
                            }

                            link.send(200, data);
                        });
                    });
                }
            });
        }
    });
};
