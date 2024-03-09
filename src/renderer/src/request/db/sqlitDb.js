
const sqlite3 = require("sqlite3").verbose()
const path=require("path")

const sqliteDbPath=""+"movice.db";
var db = new sqlite3.Database(sqliteDbPath)
export default db
