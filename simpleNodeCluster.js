/*
 *Assuming  we have an app.js file where we initialize the app.
 *
 * To reload cluster:-
 *  sudo kill -SIGUSR2 pid_of_master_process
 *
 */

var cluster = require('cluster'),
    //workers = {},
    count = require('os').cpus().length;

/*
 * Function to fork new workers.
 */
function spawn(){
    var worker = cluster.fork();
    //workers[worker.process.pid] = worker;
    console.log('NODE:: Forking a worker with id - '+ worker.process.pid);
    return worker;
}

/*
 * If its a master process.
 */
if (cluster.isMaster){

    /*
     *  Create workers equal to no of cpu cores.
     */
    for (var i=0; i< count; i++){
        spawn();
    }


    /*
     * If a cluster dies check if its a suicide or a premature death.
     * Fork a worker if its  not a suicide.
     */
    cluster.on('exit', function(worker){
        if (worker.suicide === true) {
            //console.log('Oh, it was just suicide\' – no need to worry').
        }else{
            console.log('NODE:: Worker with id - '+ worker.process.pid +' died prematurely.');
            //delete workers[worker.process.pid];
            spawn();
        }
    });


  /*
     * On receiving a SIGUSR2 signal delete the cache of the application. One by
     * one restart the workers.
     */
    process.on('SIGUSR2', function(){
        console.log('NODE::SIGUSR2 - Signal received, reloading workers.');


        //reloading one worker at a time
        var _workers = Object.keys(cluster.workers);

        var _killIt = function(){
            var _workerRef = _workers.pop(),
                _id,
                _timeout,
                _newWorker,
                _worker ;

            if (!_workerRef){
                return;
            }

            _worker = cluster.workers[_workerRef];
            if(!_worker){
                 return;
            }
            _id = _worker.process.pid;

            console.log("NODE::SIGUSR2 - Killing worker with id: "+ _id);


            //Disconnecting the cluster
            _worker.send('shutdown');
            _worker.disconnect();

            _timeout = setTimeout(function(){_worker.kill(); /*delete workers[_worker.process.id]; */}, 5000);


            //adding disconnect listener
            _worker.on("disconnect", function() {
                    console.log("NODE::SIGUSR2 - Shutdown complete for worker : " + _id);
                });


            _newWorker = cluster.fork();

            _newWorker.on('listening', function(){
                console.log('NODE::SIGUSR2 - Replacement worker online. Worker: '+ _newWorker.process.pid);
                //workers[_newWorker.process.pid] = _newWorker;
                _killIt();
            });
        }

        _killIt();
    });
}else{

    // Executing server code

    // Load the http module to create an http server.
    var http = require('http');

    // Configure our HTTP server to respond with Hello World to all requests.
    var server = http.createServer(function (request, response) {
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.end("Hello World\n");
    });

    // Listen on port 8000, IP defaults to 127.0.0.1
    server.listen(8000);

    // Put a friendly message on the terminal
    console.log("Server running at http://127.0.0.1:8000/");
}


