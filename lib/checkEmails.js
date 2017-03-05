// function checkEmails (users, email) {
//   for (let key of Object.keys(users)) {
//     if (users[key]['email'] === email) return key
//   }
//   return false
// }

function checkEmails (knex, email) {
  knex.select('id', 'email').from('users').where('email', email)
  .then( (result) => {
    if (result.length !== 0) {
      return result[0].id;
    } else {
      return false
    }
  });
}



module.exports = checkEmails;
