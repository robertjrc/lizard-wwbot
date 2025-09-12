export default (client) => client.on('auth_failure', msg => console.error('AUTHENTICATION FAILURE', msg));
