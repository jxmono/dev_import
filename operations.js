// Require projects module from same directory.
var Projects = require("./projects");

/*
 *  Import projects
 *  ===============
 *  1. Get all repositories from Github for logged owner
 *  2. Filter for Mono projects
 *  3. Create monoProjects array of objects:
 *  {
 *      "type": "a",
 *      "repo": "...",
 *      "owner": link.session.ownerId
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

    var data = {
        auth: {
            type: "oauth",
            token: link.session.accessToken
        },
        type: link.data.subtype,
        per_page: 100,
        user: link.session.login
    };

    // Get user repositories
    M.repo.getUserRepos("github", data.user, data, function (err, reposArray) {

        if (err) {
            link.send(400, err);
            return;
        }

        var monoProjects = [];
        var count = 0;

        // For each repo in reposArray
        for (var i = 0; i < reposArray.length; ++i) {
            
            // Repo object
            var appObj = reposArray[i];
            var currentRepo = appObj.name;

            // This variable will be passed into hasFile function.
            var searchData = {
                auth: {
                    type: "oauth",
                    token: link.session.accessToken
                },
                user: appObj.owner.login,
                path: (link.data.type === "a" ? M.config.APPLICATION_DESCRIPTOR_NAME : M.config.MODULE_DESCRIPTOR_NAME),
                repo: currentRepo,
                appObj: appObj
            };

            // In same time hasFile function will be called multiple times.
            // This is a great optimization method.
            M.repo.hasFile("github", searchData, function (err, descriptor, data) {
               
                // Increment count.
                ++count;
                
                // An non-404 error ocured. Kill operation.
                if (err && err.code !== 404) {
                    link.send(400, err);
                    return;
                }

                // The repo is a Mono project
                if (descriptor) {

                    var jsonDescriptor;
                    try {
                        jsonDescriptor = JSON.parse(descriptor);
                    }
                    catch(e) {}

                    if (jsonDescriptor) {
                        appObj = data.appObj;
                        var repo = reposArray[i];
                        
                        // Data to insert in database for each Mono project
                        var monoProjectData = {
                            "type": link.data.type,
                            "owner": link.session._uid,
                            "ownership": link.data.subtype,
                            "repo_url": appObj.git_url,
                            "repo": "github/" + appObj.full_name,
                            "name": jsonDescriptor.name,
                            "descriptor": jsonDescriptor
                        };
                        
                        // Push project data in Mono projects array.
                        monoProjects.push(monoProjectData);
                    }
                }

                // When count is reposArray.length, all repos were completed
                if (count === reposArray.length) {
               
                    var filters = { 
                        "type": link.data.type
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
