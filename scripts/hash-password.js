const bcryptjs = require('bcryptjs');

let desired_password = 'passwordhere';

let hash = bcryptjs.hashSync(desired_password,3);

console.log(hash);
