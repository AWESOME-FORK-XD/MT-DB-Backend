const bcryptjs = require('bcryptjs');

let desired_password = 'not password';

let hash = bcryptjs.hashSync(desired_password,3);

console.log(hash);
