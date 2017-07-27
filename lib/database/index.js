////########################################################################################
// Dependancies
//########################################################################################
const mysql = require('mysql')
const utils = require('../utils.js')

//########################################################################################
// Configuration
//########################################################################################
let connection          = null

const events            = utils.emitter
const log               = utils.log
const db_config         = {

        host      : 'localhost',
        user      : 'root',
        password  : 'toor',
        database  : 'saam'    

}


//########################################################################################
// Function
//########################################################################################

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);         // We introduce a delay before attempting to reconnect,
    }                                             // to avoid a hot loop, and to allow our node script to
  });                                             // process asynchronous requests in the meantime.
                                                  // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}


function initDb(){
    log.debug('Initializing database connection')
    handleDisconnect()                            // create a new connection with error handler
    log.info('database connected!')
}

function closeDb(){
    log.debug('Closing database connection')
    connection.end()                              // close database connection
    log.info('Database connection succesfully closed')
}




//########################################################################################
// Main
//########################################################################################

function start(){
    log.info('initializing db')
    initDb()
    log.info('starting database module listener')
    events.on('insertLog',                      insertLog)

}

//########################################################################################
// Exports
//########################################################################################

exports.start                   = start
exports.initDb                  = initDb
exports.closeDb                 = closeDb
exports.searchLogs              = searchLogs
exports.getPort                 = getPort
exports.searchLogsByName        = searchLogsByName
exports.downloadLog             = downloadLog

