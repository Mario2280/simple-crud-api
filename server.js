require('dotenv').config();
const http = require('http');
const {
    v4: uuidv4,
    validate: isValid
} = require('uuid');
const objects = [];
class User {
    constructor(name, age, hobbies) {
        if (typeof name == 'string' && typeof age == 'number' && Array.isArray(hobbies)) {
            this.name = name;
            this.age = age;
            this.hobbies = hobbies;
            this.id = uuidv4();
        } else {
            throw new Error('Incorrect type of field');
        }
    }
}
const PORT = process.env.PORT || 4000;

let ResWithMes = function (res, msg, code) {
    res.statusCode = code;
    res.end(msg || '');
};

const server = http.createServer((req, res) => {  
    try {        
        let parsedUrl = req.url.slice(1).split('/');
        if (parsedUrl.length > 2) {
            ResWithMes(res, `Cannot found ${parsedUrl[0]} ... root`, 404);
        } else {
            if (parsedUrl[0] == 'person') {
                try {
                    if (parsedUrl[1]) {
                        switch (req.method) {
                            case 'GET':
                                if(isValid(parsedUrl[1])){                               
                                    let result = objects.find((el, i, arr) => el.id == parsedUrl[1]);
                                    if(result != undefined){
                                        ResWithMes(res, Buffer.from(JSON.stringify(result)), 200);
                                    } else {
                                        ResWithMes(res, "PersonId not found", 404);
                                    }                               
                                } else {
                                    ResWithMes(res, "Incorrect personId", 400);
                                }
                                break;
                            case 'PUT':
                                if(isValid(parsedUrl[1])){                               
                                    let index = objects.findIndex((el, i, arr) => el.id == parsedUrl[1]);   
                                    if(index != -1){ 
                                        let body = '';
                                        req.on('data', (data) => {
                                            body += data;
                                        });
                                        req.on('end', () => {       
                                            try {
                                                body = JSON.parse(body);
                                                if (body.name != null && body.age != null && body.hobbies != null) {                              
                                                    if(typeof body.name == 'string' && typeof body.age == 'number' && typeof body.hobbies == 'object'){
                                                        objects[index].name = body.name;
                                                        objects[index].age = body.age;
                                                        objects[index].hobbies = body.hobbies;
                                                        ResWithMes(res, Buffer.from(JSON.stringify(objects[index])), 200);
                                                    } else {
                                                        ResWithMes(res, "Incorrect type of fields", 404);
                                                    }                                     
                                                } else {                           
                                                    ResWithMes(res, "Required fields are missing", 404);
                                                }
                                            } catch (error) {
                                                ResWithMes(res, 'Incorrect type of fields', 404);
                                            }
                                        });         
                                    } else {
                                        ResWithMes(res, "PersonId not found", 404);
                                    }          
                                } else {
                                    ResWithMes(res, "Incorrect personId", 400);
                                }
                                break;
                            case 'DELETE':
                                if(isValid(parsedUrl[1])){
                                    let index = objects.findIndex((el, i, arr) => el.id == parsedUrl[1]);   
                                    if(index != -1){
                                        let deleteObject = objects[index];
                                        objects.splice(index, 1);
                                        ResWithMes(res, `Deleted person ${Buffer.from(JSON.stringify(deleteObject))}`, 204);
                                    } else {
                                        ResWithMes(res, "PersonId not found", 404);
                                    }
                                } else {
                                    ResWithMes(res, "Incorrect personId", 400);
                                }
                                break;
                            default:
                                ResWithMes(res, 'Invalid Method', 404);
                                break;
                        }
                    } else {
                        if (req.method == 'POST') {
                            let body = '';
                            req.on('data', (data) => {
                                body += data;
                            });
                            req.on('end', () => {       
                                try {
                                    body = JSON.parse(body);
                                    if (body.name != null && body.age!= null && body.hobbies!= null) {                                
                                        let newUser = new User(body.name, body.age, body.hobbies);
                                        objects.push(newUser);
                                        ResWithMes(res, Buffer.from(JSON.stringify(newUser)), 201);                            
                                    } else {                           
                                        ResWithMes(res, "Required fields are missing", 400);
                                    }
                                } catch (error) {
                                    ResWithMes(res, error.message, 404);
                                }
                            });                             
                        } else {
                            if(req.method == 'GET') {
                                if(objects.length){  
                                    ResWithMes(res, Buffer.from(JSON.stringify(objects)), 200);
                                } else {
                                    ResWithMes(res, "List of persons is empty ", 404);
                                }           
                            } else {
                                ResWithMes(res, `Unprocessed ${req.method} request`, 404);
                            }
                            
                        }
                    } 
                } catch (error) {
                    ResWithMes(res, error.message, 500);
                }                
            } else {
                ResWithMes(res, `Cannot found ${parsedUrl[0]} ... root`, 404);
            }
        }
    } catch (error) {
        ResWithMes(res, error.message, 500);
    }
});



server.listen(PORT, () => {
    objects.push({name:'qwe', age:12, hobbies: [], id:uuidv4(),});
    objects.push({name:'asd', age:122, hobbies: [], id:uuidv4(),});
    console.log(`listening on port ${PORT}`);
});