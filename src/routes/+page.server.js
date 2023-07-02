import {
    SECRET_DB_DRIVER
    ,SECRET_DB_HOST
    ,SECRET_DB_PORT
    ,SECRET_DB_NAME
    ,SECRET_DB_USER
    ,SECRET_DB_PASS
} from '$env/static/private';
import zod from 'zod';

const searchSchema = zod.object({
    terms: zod.
            string({ required_error: 'Terms is required to search', invalid_type_error: 'Terms should be a text to be searched'})
            .trim()
            .min(3,{message: 'Must be 3 or more characters long'})
}).strict()

function getData(terms){

    if(SECRET_DB_DRIVER == 'mysql'){
        var mysql = import('mysql2');
    } else if(SECRET_DB_DRIVER == 'postgres'){
        return getPostgreSQLData(terms)
    }
    return {
        result: []
    }
}

async function getPostgreSQLData(terms){
    var postgres = import('postgres');
    const pg = (await postgres).default

    let port = SECRET_DB_PORT ? SECRET_DB_PORT : 5432;

    let options = {
        host: SECRET_DB_HOST,
        port: port,
        database: SECRET_DB_NAME,
        username: SECRET_DB_USER,
        password: SECRET_DB_PASS
    }
    const sql = pg(options)

    const result = await sql`
        SELECT
            table_name,
            table_catalog as db_name,
            column_name as field_name,
            data_type
        FROM
            information_schema.columns
        WHERE
            table_name ILIKE ${ '%' + terms + '%' }
            OR
            column_name ILIKE ${ '%' + terms + '%' }
    `

    return result
}

async function getMySQLData(){
/* 
var connection = mysql.createConnection({host:'mydbserver', user: 'user', database: 'schemaname'});
 
connection.query('SELECT * FROM `employees` WHERE `name` = "Bob" AND `age` > 35', function (err, results, fields) {
console.log(results);
});
 
// with placeholder
connection.query('SELECT * FROM `employees` WHERE `name` = "Bob" AND `age` > ?', [45], function (err, results) {
console.log(results);
});
*/
}

export async function load( { params }) {
    return {};
}


export const actions = {
    search: async ( {request}) => {
        
        let formData = Object.fromEntries(await request.formData());
        let formError = Object.keys(formData).reduce((acc,curr) => (acc[curr]=[],acc),{});
        try{
            var data = searchSchema.parse(formData);

            if ( data.terms ){
                const result = await getData(data.terms);

                return {
                    success: true,
                    formData,
                    formError,
                    result
                }
            } else {
                return {
                    success: true,
                    formData,
                    formError,
                    result:[]
                };
            }

        } catch( err ){

            const { fieldErrors: errors } = err.flatten();

            return {
                success: false,
                formData,
                result:[],
                formError:errors
            }
        }

    }
}