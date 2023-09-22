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
        return getMySQLData(terms);
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

async function getMySQLData(terms){
    let mysql2 = import('mysql2/promise');
    const mysql = (await mysql2).default

    let connection = await mysql.createConnection({
        host:SECRET_DB_HOST,
        user: SECRET_DB_USER,
        database: SECRET_DB_NAME,
        password: SECRET_DB_PASS
    });

    const [result,fields] = await connection.execute(`
        SELECT
            TABLE_NAME AS table_name,
            TABLE_SCHEMA as db_name,
            column_name as field_name,
            DATA_TYPE AS data_type
        FROM
            information_schema.columns
        WHERE
            table_name LIKE ?
            OR
            column_name LIKE ?
        `, ['%'+terms+'%','%'+terms+'%']);

    return result;
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
console.log(err);
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
