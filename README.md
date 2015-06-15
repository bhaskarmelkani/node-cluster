# node-cluster
Node Clusters with zero down time reload.

To reload the cluster and have updated code, pass SIGUSR2 signal to master process using the following command:_

sudo kill -SIGUSR2  process_id_of_master_process


For Express app:-
Start with cluster.js file.


Default Server port: 8000
