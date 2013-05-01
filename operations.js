var Projects = require("./projects");

/*
    ================
        APPS PART
    ================
*/

/*
 *  Import apps
 *  1. Get all repositories from Github for logged owner
 *  2. Filter for Mono apps
 *  3. Create monoProjects array of objects:
 *  {
 *      "type": "a",
 *      "repo": "...",
 *      "owner": link.session.ownerId
 *  }
 *  4. Insert the array of objects into database
 */
exports.importApps = function(link) {

    var data = {
        auth: {
            type: "oauth",
            token: link.session.accessToken
        },
        type: "owner",
        per_page: 100
    };

    var username = link.session.login;

    M.repo.getUserRepos("github", username, data, function (err, reposArray) {

        if (err) {
            link.send(400, err);
            return;
        }

        /*
         *  Recursive function that goes throught every 
         *  repository from Github and check if it is a 
         *  Mono application
         */
        var i = 0;
        var monoProjects = [];
        
        function getMonoApps(appObj) {

            if (!appObj) {
                link.send(200, monoProjects);

                Apps.delete(link, function (err) {
                    
                    if (err) {
                        link.send(400, err);
                        return;
                    }
                   
                    console.log(monoProjects);

                    Apps.insert(link, monoProjects, function(err, data) {
                        
                        if (err) {
                            link.send(400, err);
                            return;
                        }

                        link.send(200, data);
                    });
                });
                return;
            }

            var currentRepo = appObj.name;
            console.log(currentRepo);

            var data = {
                auth: {
                    type: "oauth",
                    token: link.session.accessToken
                },
                user: username,
                path: M.config.APPLICATION_DESCRIPTOR_NAME,
                repo: currentRepo
            };

            M.repo.hasFile("github", data, function (err, descriptor) {
                
                if (err && err.code !== 404) {
                    link.send(400, err);
                    return;
                }

                if (descriptor) {
                    
                    var repo = reposArray[i];

                    var monoProjectData = {
                        "type": "a",
                        "owner": link.session._uid,
                        "repo": appObj.git_url
                    };
                    
                    monoProjects.push(monoProjectData);
                }

                getMonoApps(reposArray[++i]);
            });
        }
        getMonoApps(reposArray[0]);
    });
};

/*
    ===================
        MODULES PART
    ===================
*/
exports.importModules = function(link) {
    // Not yet implemented
};
